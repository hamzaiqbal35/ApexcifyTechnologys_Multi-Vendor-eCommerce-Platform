const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Webhook must be handled carefully in app.js with raw body parser
// But we can route it here. Note: the raw body parsing must happen BEFORE express.json()
// We'll configure this specifically in app.js

module.exports = router;
