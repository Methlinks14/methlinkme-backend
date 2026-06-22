const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    default: 15000
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  method: {
    type: String,
    enum: ['transfer', 'card'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true
  },
  proofOfPayment: {
    type: String,
    default: ''
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);