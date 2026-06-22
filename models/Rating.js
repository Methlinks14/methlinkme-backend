const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true, 'Please write a review'],
    trim: true
  },
  dealConfirmed: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Prevent user from rating same provider twice
ratingSchema.index({ user: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);