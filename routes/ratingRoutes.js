const express = require('express');
const router = express.Router();
const {
  submitRating,
  getProviderRatings
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/:providerId', protect, submitRating);
router.get('/:providerId', getProviderRatings);

module.exports = router;