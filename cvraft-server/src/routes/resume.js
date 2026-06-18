const express = require('express');
const router = express.Router();
const {
  generateResume,
  getAllResumes,
  getResume,
  previewResume,
  downloadPDF,
  deleteResume,
  generateCoverLetter,
  downloadCoverLetterPDF,
  updateResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { FONTS, COLORS } = require('../services/latexService');

// GET /api/resume/options — get available fonts and colors
router.get('/options', (req, res) => {
  res.json({
    success: true,
    fonts: Object.entries(FONTS).map(([id, f]) => ({
      id, name: f.name
    })),
    colors: Object.entries(COLORS).map(([id, c]) => ({
      id, name: c.name, hex: c.hex
    }))
  });
});

router.post('/generate',              protect, generateResume);
router.get('/all',                    protect, getAllResumes);
router.post('/:id/cover-letter',      protect, generateCoverLetter);
router.get('/:id/cover-letter/pdf',  protect, downloadCoverLetterPDF);
router.get('/:id/preview',            protect, previewResume);   // Free watermarked
router.get('/:id/pdf',                protect, downloadPDF);     // Paid only
router.get('/:id',                    protect, getResume);
router.put('/:id',                    protect, updateResume);
router.delete('/:id',                 protect, deleteResume);

module.exports = router;
