const Provider = require('../models/Provider');
const User = require('../models/User');
const { uploadImage } = require('../utils/cloudinary');
const { v4: uuidv4 } = require('uuid');

// @desc    Register as provider (after payment confirmed)
// @route   POST /api/providers/register
exports.registerProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const existing = await Provider.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Provider profile already exists'
      });
    }

    const {
      businessName, tagline, about, category,
      services, location, contact, tags
    } = req.body;

    const portfolioUrl = `${businessName.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0,6)}`;

    const provider = await Provider.create({
      user: req.user.id,
      businessName,
      tagline,
      about,
      category,
      services: services ? JSON.parse(services) : [],
      location: location ? JSON.parse(location) : {},
      contact: contact ? JSON.parse(contact) : {},
      tags: tags ? JSON.parse(tags) : [],
      portfolioUrl,
      paymentStatus: 'pending',
      isActive: false
    });

    user.role = 'provider';
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Provider profile created. Awaiting payment confirmation.',
      provider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload provider images
// @route   POST /api/providers/upload-images
exports.uploadProviderImages = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    if (req.files.profilePicture) {
      const result = await uploadImage(
        req.files.profilePicture[0].buffer, 'profiles'
      );
      provider.profilePicture = result.secure_url;
    }

    if (req.files.coverImage) {
      const result = await uploadImage(
        req.files.coverImage[0].buffer, 'covers'
      );
      provider.coverImage = result.secure_url;
    }

    if (req.files.portfolioImages) {
      const uploads = await Promise.all(
        req.files.portfolioImages.map(f =>
          uploadImage(f.buffer, 'portfolios')
        )
      );
      provider.portfolioImages = uploads.map(r => r.secure_url);
    }

    await provider.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      provider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active providers
// @route   GET /api/providers
exports.getProviders = async (req, res) => {
  try {
    const {
      search, category, city, state, country,
      minRating, sort, page = 1, limit = 12
    } = req.query;

    const query = { isActive: true, paymentStatus: 'confirmed' };

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'services.title': { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = { $regex: category, $options: 'i' };
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (country) query['location.country'] = { $regex: country, $options: 'i' };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    let sortObj = { createdAt: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'views') sortObj = { views: -1 };
    if (sort === 'deals') sortObj = { successfulDeals: -1 };
    // Badge holders always get a visibility boost
    if (sort === 'badge') sortObj = { rewardBadge: -1, averageRating: -1 };

    const skip = (page - 1) * limit;
    const total = await Provider.countDocuments(query);

    const providers = await Provider.find(query)
      .populate('user', 'fullName email avatar')
      .sort({ rewardBadge: -1, ...sortObj })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      providers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single provider by portfolioUrl
// @route   GET /api/providers/:portfolioUrl
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      portfolioUrl: req.params.portfolioUrl
    }).populate('user', 'fullName email avatar');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Increment views
    provider.views += 1;
    await provider.save();

    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/update
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const fields = [
      'businessName','tagline','about','category','tags'
    ];
    fields.forEach(f => {
      if (req.body[f]) provider[f] = req.body[f];
    });

    if (req.body.services) provider.services = JSON.parse(req.body.services);
    if (req.body.location) provider.location = JSON.parse(req.body.location);
    if (req.body.contact) provider.contact = JSON.parse(req.body.contact);

    await provider.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      provider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my provider profile
// @route   GET /api/providers/me
exports.getMyProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user.id })
      .populate('user', 'fullName email avatar');
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }
    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};