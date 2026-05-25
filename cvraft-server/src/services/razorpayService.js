const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  basic:  { amount: 14900, label: 'Basic'  },
  pro:    { amount: 24900, label: 'Pro'    },
  bundle: { amount: 34900, label: 'Bundle' }
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

module.exports = { createOrder, verifySignature, PLANS };
