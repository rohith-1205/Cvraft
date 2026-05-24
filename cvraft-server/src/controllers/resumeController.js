const Resume = require('../models/Resume');
const { structureResumeData } = require('../services/claudeService');
const { buildLatexCode, compileToPDF } = require('../services/latexService');

// POST /api/resume/generate
const generateResume = async (req, res) => {
  try {
    const { rawText, templateId } = req.body;

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide enough resume details'
      });
    }

    // Step 1 — Claude structures raw text
    console.log('📤 Sending to Claude API...');
    const structuredData = await structureResumeData(rawText);
    console.log('✅ Claude returned structured data');

    // Step 2 — Build LaTeX code
    console.log('📝 Building LaTeX code...');
    const latexCode = buildLatexCode(structuredData);
    console.log('✅ LaTeX code built');

    // Step 3 — Compile to PDF
    console.log('📄 Compiling PDF...');
    const pdfBuffer = await compileToPDF(latexCode);
    console.log('✅ PDF compiled:', pdfBuffer.length, 'bytes');

    // Step 4 — Save to MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      rawInput: rawText,
      structuredData,
      templateId: templateId || 'T001',
      latexCode,
      paymentStatus: 'pending'
    });

    console.log('✅ Resume saved to MongoDB:', resume._id);

    // Step 5 — Send PDF back to frontend
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cvraft_preview_${resume._id}.pdf"`,
      'X-Resume-Id': resume._id.toString(),
      'X-Structured-Data': JSON.stringify(structuredData)
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// GET /api/resume/all
const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('_id templateId paymentStatus createdAt structuredData.name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/resume/:id
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/resume/:id/pdf — Download PDF for paid resume
const downloadPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.paymentStatus !== 'completed') {
      return res.status(403).json({ success: false, message: 'Payment required to download' });
    }

    // Recompile PDF from saved LaTeX
    const pdfBuffer = await compileToPDF(resume.latexCode);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cvraft_${resume._id}.pdf"`
    });

    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { generateResume, getAllResumes, getResume, downloadPDF, deleteResume };
