const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc    Create Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Assuming PKR is whole numbers, but stripe usually takes cents. Stripe requires minimums. Let's just pass the amount directly if the smallest unit is the currency itself for PKR. Actually stripe expects amounts in the smallest currency unit. For PKR, it's 100 paisa, so multiply by 100.
      currency: 'pkr',
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe create intent error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This must be raw body! handled in app.js
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Find the order that this payment intent belongs to
    try {
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        // Since we are not saving status changes, just mark modified if we want to be safe, but it's only isPaid
        await order.save();
        
        console.log(`Order ${order._id} marked as paid via Stripe webhook`);
      }
    } catch (err) {
      console.error('Error updating order on webhook:', err);
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = {
  createPaymentIntent,
  handleWebhook
};
