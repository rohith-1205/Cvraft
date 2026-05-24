const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rawInput: {
    type: String,
    required: true
  },
  structuredData: {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    summary: String,
    education: [{ degree: String, college: String, year: String, cgpa: String }],
    experience: [{ company: String, role: String, duration: String, points: [String] }],
    projects: [{ name: String, techStack: String, points: [String] }],
    skills: { languages: [String], frameworks: [String], tools: [String] },
    achievements: [String],
    certifications: [String]
  },
  templateId: { type: String, default: 'T001' },
  latexCode: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  paymentId: { type: String, default: '' },
  pdfUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
