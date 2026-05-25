const Resume = require('../models/Resume');
const { structureResumeData, generateCoverLetterText } = require('../services/claudeService');
const { buildLatexCode, compileToPDF, buildCoverLetterLatex } = require('../services/latexService');

// POST /api/resume/generate
const generateResume = async (req, res) => {
  try {
    const { rawText, templateId, fontId, colorId } = req.body;

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

    // Step 2 — Build LaTeX code (clean version saved to database)
    console.log('📝 Building LaTeX code...');
    const latexCode = buildLatexCode(
      structuredData, 
      templateId || 'T001', 
      fontId     || 'F001', 
      colorId    || 'C001', 
      false
    );
    console.log('✅ LaTeX built for template:', templateId, 'font:', fontId, 'color:', colorId);

    // Step 3 — Save to MongoDB ONLY — do NOT send PDF yet
    const resume = await Resume.create({
      userId: req.user._id,
      rawInput: rawText,
      structuredData,
      templateId: templateId || 'T001',
      fontId:     fontId     || 'F001',
      colorId:    colorId    || 'C001',
      latexCode,
      paymentStatus: 'pending'
    });

    console.log('✅ Resume saved:', resume._id);

    // Step 4 — Return ONLY the resume ID and structured data
    // NO PDF returned here — user must pay first
    res.status(201).json({
      success: true,
      message: 'Resume generated successfully',
      resumeId: resume._id,
      structuredData
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// GET /api/resume/:id/preview — Watermarked preview (free)
const previewResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Compile PDF from saved LaTeX with watermark
    console.log('📝 Building watermarked LaTeX code for preview...');
    const watermarkedLatex = buildLatexCode(
      resume.structuredData,
      resume.templateId,
      resume.fontId || 'F001',
      resume.colorId || 'C001',
      true // isWatermarked = true
    );

    const pdfBuffer = await compileToPDF(watermarkedLatex);

    // Return PDF with watermark headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="preview_${resume._id}.pdf"`,
      'X-Resume-Id': resume._id.toString(),
      'Cache-Control': 'no-store'
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Preview error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview'
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

// POST /api/resume/:id/cover-letter
const generateCoverLetter = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!resume.hasCoverLetter) {
      return res.status(403).json({
        success: false,
        message: 'Cover Letter access is not unlocked for this resume. Please buy the Bundle plan or unlock it.'
      });
    }

    // Generate if not already generated
    if (!resume.coverLetterLatexCode) {
      console.log('📤 Sending to Claude for Cover Letter...');
      const bodyText = await generateCoverLetterText(resume.structuredData);
      console.log('✅ Cover letter text generated');

      const latex = buildCoverLetterLatex(
        resume.structuredData,
        bodyText,
        resume.fontId || 'F001',
        resume.colorId || 'C001'
      );

      resume.coverLetterText = bodyText;
      resume.coverLetterLatexCode = latex;
      await resume.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cover Letter generated successfully',
      text: resume.coverLetterText
    });

  } catch (err) {
    console.error('❌ Cover letter generation error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// GET /api/resume/:id/cover-letter/pdf — Download Cover Letter PDF
const downloadCoverLetterPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!resume.hasCoverLetter || !resume.coverLetterLatexCode) {
      return res.status(403).json({
        success: false,
        message: 'Cover Letter is not generated or unlocked. Please purchase/generate it first.'
      });
    }

    console.log('📄 Compiling Cover Letter PDF...');
    const pdfBuffer = await compileToPDF(resume.coverLetterLatexCode);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cvraft_cover_letter_${resume._id}.pdf"`,
      'Cache-Control': 'no-store'
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Download cover letter error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Cover Letter PDF'
    });
  }
};

module.exports = {
  generateResume,
  getAllResumes,
  getResume,
  previewResume,
  downloadPDF,
  deleteResume,
  generateCoverLetter,
  downloadCoverLetterPDF
};
