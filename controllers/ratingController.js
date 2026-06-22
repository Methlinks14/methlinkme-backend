const Rating = require('../models/Rating');
const Provider = require('../models/Provider');

// @desc    Submit a rating
// @route   POST /api/ratings/:providerId
exports.submitRating = async (req, res) => {
  try {
    const { rating, review, dealConfirmed } = req.body;
    const providerId = req.params.providerId;

    const existing = await Rating.findOne({
      user: req.user.id,
      provider: providerId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this provider'
      });
    }

    const newRating = await Rating.create({
      user: req.user.id,
      provider: providerId,
      rating,
      review,
      dealConfirmed
    });

    // Update provider average rating and deal count
    const allRatings = await Rating.find({ provider: providerId });
    const avg = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;
    const confirmedDeals = allRatings.filter(r => r.dealConfirmed).length;

    await Provider.findByIdAndUpdate(providerId, {
      averageRating: Math.round(avg * 10) / 10,
      totalRatings: allRatings.length,
      successfulDeals: confirmedDeals
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ratings for a provider
// @route   GET /api/ratings/:providerId
exports.getProviderRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({
      provider: req.params.providerId,
      isApproved: true
    })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};