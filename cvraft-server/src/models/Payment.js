const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'bundle'],
    default: 'pro'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
