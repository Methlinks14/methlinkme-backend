const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ==========================
// CREATE PAYMENT INTENT (₦15,000)
// ==========================
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const amount = 15000 * 100; // Stripe uses kobo (smallest unit)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "ngn",
      payment_method_types: ["card"],
      metadata: {
        userId: req.user.id
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

// ==========================
// CONFIRM PAYMENT (MARK PROVIDER ACTIVE)
// ==========================
router.post("/confirm", protect, async (req, res) => {
  try {
    const Provider = require("../models/Provider");

    const provider = await Provider.findOne({ user: req.user.id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }

    provider.paymentStatus = "confirmed";
    provider.isActive = true;
    provider.paymentDate = new Date();

    await provider.save();

    res.json({
      success: true,
      message: "Payment confirmed, profile is now active"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;