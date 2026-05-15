const User = require('../models/User');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice, minRating, verifiedOnly, sortBy, lat, lng, radius } = req.query;

    let query = { role: 'provider' };

    // Geospatial Proximity Search
    if (lat && lng) {
      query.locationCoords = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) || 5000 // 5km default
        }
      };
    } else if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Price Filtering
    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
    }

    // Rating & Verification Filtering
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (verifiedOnly === 'true') {
      query.isVerified = true;
    }

    // Sorting
    let sortOptions = { isFeatured: -1 }; // Featured always first
    if (sortBy === 'price_low') sortOptions.hourlyRate = 1;
    else if (sortBy === 'price_high') sortOptions.hourlyRate = -1;
    else if (sortBy === 'rating') {
      sortOptions.rating = -1;
      sortOptions.reviewsCount = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const providers = await User.find(query).select('-password').sort(sortOptions);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password');
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider availability (dates, time slots, blocked slots)
// @route   PUT /api/providers/availability
// @access  Private (Provider)
exports.updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    const { unavailableDates, workingHours, blockedSlots } = req.body;

    const provider = await User.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (Array.isArray(unavailableDates)) {
      provider.unavailableDates = unavailableDates;
    }
    if (Array.isArray(workingHours)) {
      provider.workingHours = workingHours;
    }
    if (Array.isArray(blockedSlots)) {
      provider.blockedSlots = blockedSlots;
    }

    await provider.save();

    res.json({
      message: 'Availability updated',
      unavailableDates: provider.unavailableDates,
      workingHours: provider.workingHours,
      blockedSlots: provider.blockedSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider)
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    const { name, phone, location, hourlyRate, category, image } = req.body;

    const provider = await User.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (name) provider.name = name;
    if (phone !== undefined) provider.phone = phone;
    if (location !== undefined) provider.location = location;
    if (hourlyRate !== undefined) provider.hourlyRate = hourlyRate;
    if (category) provider.category = category;
    if (image !== undefined) provider.image = image;

    await provider.save();

    res.json({
      message: 'Profile updated',
      provider: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        location: provider.location,
        hourlyRate: provider.hourlyRate,
        category: provider.category,
        image: provider.image,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a provider (completed bookings with ratings)
// @route   GET /api/providers/:id/reviews
// @access  Public
exports.getProviderReviews = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const reviews = await Booking.find({
      provider: req.params.id,
      status: 'completed',
      rating: { $exists: true, $ne: null }
    })
    .populate('user', 'name image')
    .sort({ updatedAt: -1 })
    .limit(20);

    // Calculate stats
    const allRated = await Booking.find({ provider: req.params.id, rating: { $exists: true, $ne: null } });
    const totalReviews = allRated.length;
    const avgRating = totalReviews > 0 ? (allRated.reduce((sum, b) => sum + b.rating, 0) / totalReviews).toFixed(1) : 0;
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    allRated.forEach(b => { if (b.rating >= 1 && b.rating <= 5) distribution[b.rating - 1]++; });

    res.json({
      reviews: reviews.map(r => ({
        _id: r._id,
        rating: r.rating,
        review: r.review,
        date: r.updatedAt,
        user: r.user,
      })),
      stats: {
        totalReviews,
        avgRating: parseFloat(avgRating),
        distribution, // [count1star, count2star, count3star, count4star, count5star]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated providers for homepage
// @route   GET /api/providers/top
// @access  Public
exports.getTopProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' })
      .select('-password')
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(6);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit KYC documents
// @route   PUT /api/providers/kyc
// @access  Private (Provider)
exports.submitKYC = async (req, res) => {
  try {
    const { documentUrl, documentType } = req.body;
    
    if (!documentUrl || !documentType) {
      return res.status(400).json({ message: 'Document URL and type are required' });
    }

    const provider = await User.findById(req.user.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    provider.kyc = {
      ...provider.kyc,
      documentUrl,
      documentType,
      status: 'pending',
      submittedAt: new Date()
    };

    await provider.save();
    res.json({ message: 'KYC documents submitted successfully', kyc: provider.kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
