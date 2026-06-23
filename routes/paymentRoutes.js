if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ Stripe key missing - payment routes will be limited");
}

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "test_key");

// CREATE PAYMENT INTENT
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;