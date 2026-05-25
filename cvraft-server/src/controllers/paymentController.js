const Payment = require('../models/Payment');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { createOrder, verifySignature } = require('../services/razorpayService');
const { compileToPDF, buildLatexCode } = require('../services/latexService');

// ── CREATE ORDER ──────────────────────────────────────
// POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { resumeId, plan } = req.body;

    // Validate resume exists and belongs to user
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check if already paid
    if (resume.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Resume already purchased'
      });
    }

    // Create Razorpay order
    const { order, planDetails } = await createOrder(plan || 'pro', resumeId);

    // Save payment record
    const payment = await Payment.create({
      userId: req.user._id,
      resumeId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan || 'pro',
      status: 'created'
    });

    console.log('✅ Razorpay order created:', order.id);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planDetails.label,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error('Full Razorpay error:', JSON.stringify(err, null, 2));
    console.error('Key ID being used:', process.env.RAZORPAY_KEY_ID);
    console.error('Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
    console.error('❌ Create order error:', err);
    if (err.response) {
      console.error('Response data:', err.response.data || err.response);
    }
    console.error('Error status code:', err.statusCode);
    console.error('Error error field:', err.error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: err.message || err.error || String(err),
      details: {
        statusCode: err.statusCode,
        errorField: err.error,
        response: err.response ? (err.response.data || err.response) : null
      }
    });
  }
};

// ── VERIFY PAYMENT ────────────────────────────────────
// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      resumeId
    } = req.body;

    // Verify signature
    const isValid = verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature — possible fraud attempt'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid'
      },
      { new: true }
    );

    // Update user's purchase metrics
    const user = await User.findById(req.user._id);
    const isBundle = payment && payment.plan === 'bundle';
    
    if (user) {
      if (isBundle) {
        user.allowedResumesCount += 3;
        user.allowedCoverLettersCount += 2; // current resume uses 1, 2 remaining
      } else {
        user.allowedResumesCount += 1;
      }
      
      // Add current resumeId to unlockedResumeIds if not present
      if (!user.unlockedResumeIds.includes(resumeId)) {
        user.unlockedResumeIds.push(resumeId);
      }
      await user.save();
    }

    // Update resume payment status
    await Resume.findByIdAndUpdate(resumeId, {
      paymentStatus: 'completed',
      paymentId: razorpayPaymentId,
      hasCoverLetter: isBundle // true if bundle
    });

    console.log('✅ Payment verified:', razorpayPaymentId);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      resumeId
    });

  } catch (err) {
    console.error('❌ Verify payment error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: err.message
    });
  }
};

// ── GET PAYMENT STATUS ────────────────────────────────
// GET /api/payment/status/:resumeId
const getPaymentStatus = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const user = await User.findById(req.user._id);
    const remainingDownloads = user
      ? Math.max(0, user.allowedResumesCount - user.unlockedResumeIds.length)
      : 0;

    res.status(200).json({
      success: true,
      resumeId: resume._id,
      paymentStatus: resume.paymentStatus,
      isPaid: resume.paymentStatus === 'completed',
      hasCoverLetter: resume.hasCoverLetter,
      remainingDownloads
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ── DOWNLOAD PAID PDF ─────────────────────────────────
// GET /api/payment/download/:resumeId
const downloadPaidPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check payment
    if (resume.paymentStatus !== 'completed') {
      return res.status(403).json({
        success: false,
        message: 'Payment required to download this resume'
      });
    }

    // Recompile PDF from saved LaTeX
    console.log('📄 Recompiling PDF for download...');
    const pdfBuffer = await compileToPDF(resume.latexCode);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cvraft_resume.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store'
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Download error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF for download'
    });
  }
};

// POST /api/payment/unlock-with-bundle
const unlockWithBundle = async (req, res) => {
  try {
    const { resumeId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has unused downloads
    const remainingDownloads = user.allowedResumesCount - user.unlockedResumeIds.length;
    if (remainingDownloads <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No remaining downloads left in your bundle. Please purchase a plan to unlock.'
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Resume is already unlocked'
      });
    }

    // Unlock resume
    resume.paymentStatus = 'completed';
    
    // Check cover letter eligibility
    if (user.allowedCoverLettersCount > 0) {
      resume.hasCoverLetter = true;
      user.allowedCoverLettersCount -= 1;
    }

    // Add to unlocked list
    user.unlockedResumeIds.push(resumeId);

    await resume.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume successfully unlocked using your bundle',
      resumeId
    });

  } catch (err) {
    console.error('Unlock bundle error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  downloadPaidPDF,
  unlockWithBundle
};
