const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  tagline: {
    type: String,
    trim: true,
    default: ''
  },
  about: {
    type: String,
    required: [true, 'About section is required']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  portfolioImages: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'Service category is required']
  },
  services: [{
    title: String,
    description: String,
    price: String,
    image: String
  }],
  location: {
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  contact: {
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rewardBadge: {
    type: Boolean,
    default: false
  },
  successfulDeals: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  portfolioUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{ type: String }],
}, { timestamps: true });

// Auto-award badge when successfulDeals reaches 7
providerSchema.pre('save', function(next) {
  if (this.successfulDeals >= 7) {
    this.rewardBadge = true;
  }
  next();
});

module.exports = mongoose.model('Provider', providerSchema);