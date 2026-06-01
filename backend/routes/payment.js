const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// POST /api/payment/proof — upload an advance-payment screenshot to Cloudinary.
// Returns the hosted URL, which the client then attaches to the order.
router.post('/proof', protect, upload.single('proof'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No screenshot uploaded' });
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/create-intent — create Stripe payment intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'pkr', orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses smallest currency unit
      currency,
      metadata: { orderId, userId: req.user._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/webhook — Stripe webhook (no auth middleware)
router.post('/webhook', require('express').raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { orderId } = intent.metadata;

    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: new Date(),
      status: 'processing',
      paymentResult: {
        id: intent.id,
        status: intent.status,
        updateTime: new Date().toISOString(),
      },
    });
  }

  res.json({ received: true });
});

module.exports = router;
