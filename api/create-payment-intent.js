// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function (req, res) {
  if (req.method === 'POST') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount || 50,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
