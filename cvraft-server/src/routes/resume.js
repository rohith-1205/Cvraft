const express = require('express');
const router = express.Router();
const {
  generateResume,
  getAllResumes,
  getResume,
  downloadPDF,
  deleteResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateResume);
router.get('/all', protect, getAllResumes);
router.get('/:id/pdf', protect, downloadPDF);
router.get('/:id', protect, getResume);
router.delete('/:id', protect, deleteResume);

module.exports = router;
