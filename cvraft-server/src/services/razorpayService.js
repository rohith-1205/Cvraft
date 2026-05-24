require('dotenv').config();
console.log('Razorpay Key loaded:', !!process.env.RAZORPAY_KEY_ID);
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  basic:  { amount: 29900, label: 'Basic'  },
  pro:    { amount: 49900, label: 'Pro'    },
  bundle: { amount: 79900, label: 'Bundle' }
};

const createOrder = async (plan = 'pro', resumeId) => {
  const planDetails = PLANS[plan] || PLANS.pro;
  const options = {
    amount: Number(planDetails.amount),
    currency: 'INR',
    receipt: `cvraft_${Date.now()}`,
    notes: { 
      resumeId: resumeId.toString(), 
      plan: plan
    }
  };
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create(options);
  return { order, planDetails };
};

const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

// Simple test function to isolate order creation issue
const testCreateOrder = async () => {
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 100, // 1 INR (100 paise)
      currency: 'INR',
      receipt: `test_${Date.now()}`
    });
    console.log('✅ Test Razorpay Order created successfully:', order.id);
    return order;
  } catch (err) {
    console.error('❌ Test Razorpay Order failed:', err);
    throw err;
  }
};

module.exports = { createOrder, verifySignature, testCreateOrder, PLANS };
