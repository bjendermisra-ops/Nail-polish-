const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, status } = req.body;

  if (status === 'failed') {
    await sendTelegramNotification(`❌ *Payment Failed/Cancelled*\nOrder ID: \`${razorpay_order_id}\``);
    return res.status(200).json({ status: 'notified_failure' });
  }

  // Cryptographic authentication checks to protect against client-side spoofing
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    await sendTelegramNotification(`✅ *Payment Verified Successfully!*\n\n*Amount:* ₹1.00\n*Order ID:* \`${razorpay_order_id}\`\n*Payment ID:* \`${razorpay_payment_id}\``);
    return res.status(200).json({ status: 'success' });
  } else {
    await sendTelegramNotification(`⚠️ *Security Threat Blocked!*\nSignature mismatch. Someone tried to fake a payment.\nOrder ID: \`${razorpay_order_id}\``);
    return res.status(400).json({ error: 'Signature verification failed' });
  }
};

async function sendTelegramNotification(message) {
  const token = "8848322473:AAFDrrwlvXpcC6f5hzkvvgqh1EAfK4wva0g";
  const chatId = "7326906197";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Telegram notification system failed to dispatch:', err);
  }
}
