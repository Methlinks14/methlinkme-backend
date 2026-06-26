const express = require('express');
const router = express.Router();
const User = require('../models/User');

const {
  register,
  login,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// =======================
// NORMAL ROUTES
// =======================
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// =======================
// TEMP ADMIN CREATOR
// DELETE THIS ROUTE AFTER USE
// =======================
router.get('/create-admin', async (req, res) => {
  try {
    const existing = await User.findOne({
      email: 'admin@methlinkme.com'
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Admin already exists'
      });
    }

    const admin = new User({
      fullName: 'Admin',
      email: 'admin@methlinkme.com',
      password: '123456',
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Admin created successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;