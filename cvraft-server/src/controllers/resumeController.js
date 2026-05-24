const Resume = require('../models/Resume');
const { structureResumeData } = require('../services/claudeService');

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

    console.log('📤 Sending to Claude API...');
    const structuredData = await structureResumeData(rawText);
    console.log('✅ Claude returned structured data');

    const resume = await Resume.create({
      userId: req.user._id,
      rawInput: rawText,
      structuredData,
      templateId: templateId || 'T001'
    });

    console.log('✅ Resume saved to MongoDB:', resume._id);

    res.status(201).json({
      success: true,
      message: 'Resume structured successfully',
      resumeId: resume._id,
      structuredData
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ success: false, message: 'Failed to parse Claude response' });
    }
    if (err.response?.status === 401) {
      return res.status(500).json({ success: false, message: 'Invalid Claude API key' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.status(200).json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { generateResume, getAllResumes, getResume, deleteResume };
