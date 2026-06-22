const Payment = require('../models/Payment');
const Provider = require('../models/Provider');
const User = require('../models/User');
const { sendPaymentConfirmedEmail } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');
const { uploadImage } = require('../utils/cloudinary');

// @desc    Submit payment proof
// @route   POST /api/payment/submit
exports.submitPayment = async (req, res) => {
  try {
    const { method } = req.body;
    const reference = `MLM-${uuidv4().slice(0,8).toUpperCase()}`;

    let proofUrl = '';
    if (req.file) {
      const result = await uploadImage(req.file.buffer, 'payment-proofs');
      proofUrl = result.secure_url;
    }

    const payment = await Payment.create({
      provider: req.user.id,
      method,
      reference,
      proofOfPayment: proofUrl,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted. Awaiting admin confirmation.',
      reference,
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my payment status
// @route   GET /api/payment/my-status
exports.getMyPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ provider: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};