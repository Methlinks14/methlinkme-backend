const User = require('../models/User');
const Provider = require('../models/Provider');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Chat = require('../models/Chat');
const { sendPaymentConfirmedEmail } = require('../utils/email');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await Provider.countDocuments();
    const activeProviders = await Provider.countDocuments({ isActive: true });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const totalRatings = await Rating.countDocuments();
    const totalChats = await Chat.countDocuments();
    const badgeHolders = await Provider.countDocuments({ rewardBadge: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        activeProviders,
        pendingPayments,
        totalRatings,
        totalChats,
        badgeHolders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all pending payments
// @route   GET /api/admin/payments
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('provider', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm a payment and activate provider
// @route   PUT /api/admin/payments/:id/confirm
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('provider', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = Date.now();
    await payment.save();

    // Activate provider profile
    const provider = await Provider.findOne({ user: payment.provider._id });
    if (provider) {
      provider.paymentStatus = 'confirmed';
      provider.isActive = true;
      await provider.save();
    }

    try {
      await sendPaymentConfirmedEmail(
        payment.provider.email,
        payment.provider.fullName
      );
    } catch (e) {}

    res.json({
      success: true,
      message: 'Payment confirmed. Provider is now live.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a payment
// @route   PUT /api/admin/payments/:id/reject
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'rejected';
    payment.notes = req.body.reason || 'Payment rejected by admin';
    await payment.save();

    res.json({ success: true, message: 'Payment rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all providers
// @route   GET /api/admin/providers
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend or activate a user
// @route   PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a provider
// @route   DELETE /api/admin/providers/:id
exports.deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Feature a provider
// @route   PUT /api/admin/providers/:id/feature
exports.featureProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }
    provider.isFeatured = !provider.isFeatured;
    await provider.save();
    res.json({
      success: true,
      message: `Provider ${provider.isFeatured ? 'featured' : 'unfeatured'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/admin/ratings/:id
exports.deleteRating = async (req, res) => {
  try {
    await Rating.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rating deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};