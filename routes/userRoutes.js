const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { uploadImage } = require('../utils/cloudinary');
const { sendContactEmail } = require('../utils/email');

// ==========================
// UPDATE PROFILE
// ==========================
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, location },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// UPLOAD AVATAR
// ==========================
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const result = await uploadImage(req.file.buffer, 'avatars');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// SAVE / UNSAVE PROVIDER
// ==========================
router.post('/save-provider/:providerId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const providerId = req.params.providerId;

    const alreadySaved = user.savedProviders.includes(providerId);

    if (alreadySaved) {
      // remove provider
      user.savedProviders = user.savedProviders.filter(
        id => id.toString() !== providerId
      );
    } else {
      // add provider
      user.savedProviders.push(providerId);
    }

    await user.save();

    res.json({
      success: true,
      message: alreadySaved ? 'Provider removed' : 'Provider saved',
      savedProviders: user.savedProviders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================
// SEND CONTACT MESSAGE
// ==========================
router.post('/contact', protect, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await sendContactEmail(name, email, message);

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;