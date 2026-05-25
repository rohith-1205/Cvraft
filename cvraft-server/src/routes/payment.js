const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  downloadPaidPDF,
  unlockWithBundle
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes are protected
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/unlock-with-bundle', protect, unlockWithBundle);
router.get('/status/:resumeId', protect, getPaymentStatus);
router.get('/download/:resumeId', protect, downloadPaidPDF);

module.exports = router;
