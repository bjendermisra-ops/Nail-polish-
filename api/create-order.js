const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_live_T1BHLBSu56cJd3',
  key_secret: process.env.RAZORPAY_KEY_SECRET // Hidden securely in Environment Variables
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const options = {
      amount: 100, // ₹1 (100 Paise)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
