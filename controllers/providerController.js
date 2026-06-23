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

    // 🔍 SEARCH
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // 📂 CATEGORY FILTER
    if (category) query.category = category;

    // 📍 LOCATION FILTER
    if (city) query["location.city"] = city;
    if (state) query["location.state"] = state;
    if (country) query["location.country"] = country;

    // ⭐ RATING FILTER
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // 📊 SORTING
    let sortOption = { createdAt: -1 };

    if (sort === "rating") sortOption = { averageRating: -1 };
    if (sort === "views") sortOption = { views: -1 };
    if (sort === "deals") sortOption = { successfulDeals: -1 };

    const skip = (page - 1) * limit;

    const total = await require("../models/Provider").countDocuments(query);

    const providers = await require("../models/Provider")
      .find(query)
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