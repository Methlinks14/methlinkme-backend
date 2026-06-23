const Provider = require("../models/Provider");

// REGISTER PROVIDER
exports.registerProvider = async (req, res) => {
  try {
    const provider = await Provider.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPLOAD IMAGES
exports.uploadProviderImages = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Images uploaded successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL PROVIDERS
exports.getProviders = async (req, res) => {
  try {
    const {
      search,
      category,
      city,
      state,
      country,
      minRating,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      isActive: true,
      paymentStatus: "confirmed"
    };

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category) query.category = category;
    if (city) query["location.city"] = city;
    if (state) query["location.state"] = state;
    if (country) query["location.country"] = country;

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    let sortOption = { createdAt: -1 };

    if (sort === "rating") sortOption = { averageRating: -1 };
    if (sort === "views") sortOption = { views: -1 };
    if (sort === "deals") sortOption = { successfulDeals: -1 };

    const skip = (page - 1) * limit;

    const total = await Provider.countDocuments(query);

    const providers = await Provider.find(query)
      .populate("user", "fullName email avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE PROVIDER
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      portfolioUrl: req.params.portfolioUrl
    }).populate("user", "fullName email avatar");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }

    res.json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE PROVIDER
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET MY PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user.id
    }).populate("user", "fullName email avatar");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found"
      });
    }

    res.json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};