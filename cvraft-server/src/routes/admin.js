const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminProtect');
const {
  adminLogin,
  getAnalytics,
  getUsers,
  getPayments,
  updateUserCredits,
  deleteUser,
  downloadInvoice
} = require('../controllers/adminController');

// Public route
router.post('/login', adminLogin);

// Protected routes (require admin JWT verification)
router.get('/analytics', adminProtect, getAnalytics);
router.get('/users', adminProtect, getUsers);
router.get('/payments', adminProtect, getPayments);
router.get('/payments/:id/invoice', adminProtect, downloadInvoice);
router.post('/users/:id/credits', adminProtect, updateUserCredits);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
