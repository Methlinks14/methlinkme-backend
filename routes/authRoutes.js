const express = require('express');
const router = express.Router();

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
// AUTH ROUTES
// =======================
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

router.get('/me', protect, getMe);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;