const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

// Get all service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Provider.distinct('category', {
      isActive: true,
      paymentStatus: 'confirmed'
    });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get featured services
router.get('/featured', async (req, res) => {
  try {
    const featured = await Provider.find({
      isActive: true,
      paymentStatus: 'confirmed',
      isFeatured: true
    })
      .populate('user', 'fullName avatar')
      .limit(8)
      .sort({ averageRating: -1 });

    res.json({ success: true, providers: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get badge holders
router.get('/badge-holders', async (req, res) => {
  try {
    const badgeHolders = await Provider.find({
      isActive: true,
      paymentStatus: 'confirmed',
      rewardBadge: true
    })
      .populate('user', 'fullName avatar')
      .sort({ successfulDeals: -1 });

    res.json({ success: true, providers: badgeHolders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;