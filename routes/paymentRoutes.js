const express = require('express');
const router = express.Router();
const {
  submitPayment,
  getMyPaymentStatus
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/submit',
  protect,
  upload.single('proofOfPayment'),
  submitPayment
);
router.get('/my-status', protect, getMyPaymentStatus);

module.exports = router;