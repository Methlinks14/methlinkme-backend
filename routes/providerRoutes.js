const express = require('express');
const router = express.Router();
const {
  registerProvider,
  uploadProviderImages,
  getProviders,
  getProvider,
  updateProvider,
  getMyProfile
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProviders);
router.get('/me', protect, getMyProfile);
router.get('/:portfolioUrl', getProvider);
router.post('/register', protect, registerProvider);
router.post(
  '/upload-images',
  protect,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'portfolioImages', maxCount: 6 }
  ]),
  uploadProviderImages
);
router.put('/update', protect, updateProvider);

module.exports = router;