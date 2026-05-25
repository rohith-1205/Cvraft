const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Resume = require('../models/Resume');

// ── ADMIN LOGIN ───────────────────────────────────────
// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envEmail || !envPassword) {
      console.error('🚨 ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set.');
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    if (email !== envEmail || password !== envPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Sign admin token
    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      admin: { email }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: err.message
    });
  }
};

// ── GET ANALYTICS ─────────────────────────────────────
// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    // 1. Total Counts
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'paid' });

    // 2. Total Revenue (in Rupees)
    const paidPayments = await Payment.find({ status: 'paid' });
    const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount / 100), 0);

    // 3. Plan Distribution
    const planCounts = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$plan', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    const planStats = {
      basic: { count: 0, revenue: 0 },
      pro: { count: 0, revenue: 0 },
      bundle: { count: 0, revenue: 0 }
    };

    planCounts.forEach(item => {
      if (planStats[item._id]) {
        planStats[item._id].count = item.count;
        planStats[item._id].revenue = item.total / 100;
      }
    });

    // 4. Daily Income Trend (Last 30 Days)
    const dailyIncomeTrend = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
          revenue: { $sum: { $divide: ["$amount", 100] } },
          sales: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Reverse for graph chronological order
    dailyIncomeTrend.reverse();

    // 5. Recent Payments (Last 10)
    const recentPayments = await Payment.find({ status: 'paid' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalResumes,
        totalPayments,
        totalRevenue,
        planStats,
        dailyIncomeTrend,
        recentPayments
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: err.message
    });
  }
};

// ── GET ALL USERS ─────────────────────────────────────
// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Enrich users list with resume counts
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const resumeCount = await Resume.countDocuments({ userId: user._id });
      const completedPaymentCount = await Payment.countDocuments({ userId: user._id, status: 'paid' });
      return {
        ...user.toObject(),
        resumeCount,
        completedPaymentCount
      };
    }));

    res.status(200).json({
      success: true,
      users: enrichedUsers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: err.message
    });
  }
};

// ── GET ALL TRANSACTIONS ──────────────────────────────
// GET /api/admin/payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('resumeId', 'templateId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: err.message
    });
  }
};

// ── UPDATE USER CREDITS ──────────────────────────────
// POST /api/admin/users/:id/credits
const updateUserCredits = async (req, res) => {
  try {
    const { allowedResumesCount, allowedCoverLettersCount } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (typeof allowedResumesCount === 'number') {
      user.allowedResumesCount = allowedResumesCount;
    }
    if (typeof allowedCoverLettersCount === 'number') {
      user.allowedCoverLettersCount = allowedCoverLettersCount;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User credits updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        allowedResumesCount: user.allowedResumesCount,
        allowedCoverLettersCount: user.allowedCoverLettersCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user credits',
      error: err.message
    });
  }
};

// ── DELETE USER & ALL RESUMES ─────────────────────────
// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete resumes
    await Resume.deleteMany({ userId });
    
    // Delete payments
    await Payment.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: err.message
    });
  }
};

// ── DOWNLOAD INVOICE PDF ──────────────────────────────
// GET /api/admin/payments/:id/invoice
const downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with payment not found'
      });
    }

    // Build invoice LaTeX and compile to PDF
    const { buildInvoiceLatex, compileToPDF } = require('../services/latexService');
    const latexCode = buildInvoiceLatex(payment, user);
    const pdfBuffer = await compileToPDF(latexCode);

    const filename = `invoice_${payment.razorpayPaymentId || payment._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice download error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate and download invoice PDF',
      error: err.message
    });
  }
};

module.exports = {
  adminLogin,
  getAnalytics,
  getUsers,
  getPayments,
  updateUserCredits,
  deleteUser,
  downloadInvoice
};
