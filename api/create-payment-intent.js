const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function (req, res) {
  if (req.method === 'POST') {
    const { amount, payment_method } = req.body;

    try {
      const intent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method: payment_method,
        confirmation_method: 'automatic',
        confirm: true,
        return_url: 'https://cardanalyzer.techpimp.site',
        capture_method: 'manual' // So you can cancel later
      });

      if (intent.status === 'requires_capture' || intent.status === 'succeeded') {
        res.status(200).json({ success: true, clientSecret: intent.client_secret });
      } else {
        res.status(400).json({ success: false, error: intent.last_payment_error?.message || 'Card not authorized' });
      }
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
