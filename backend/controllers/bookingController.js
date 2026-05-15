const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = async (req, res) => {
  try {
    const { providerId, serviceLocation, date, time, notes, estimatedHours } = req.body;

    const provider = await User.findById(providerId);

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.unavailableDates && provider.unavailableDates.includes(date)) {
      return res.status(400).json({ message: 'Provider is not available on this date' });
    }

    if (provider.blockedSlots && provider.blockedSlots.some(s => s.date === date && s.time === time)) {
      return res.status(400).json({ message: 'This time slot is not available on the selected date' });
    }

    const hours = estimatedHours || 2;
    const totalPrice = (provider.hourlyRate || 300) * hours + 50; // rate * hours + platform fee

    const booking = await Booking.create({
      user: req.user.id,
      provider: providerId,
      serviceLocation,
      date,
      time,
      notes,
      estimatedHours: hours,
      totalPrice,
      status: 'pending'
    });

    const populated = await Booking.findById(booking._id)
      .populate('provider', 'name category rating image hourlyRate')
      .populate('user', 'name phone email');

    // Send email to provider
    await sendEmail({
      to: provider.email,
      subject: 'New Booking Request on Kaamwale!',
      htmlContent: `
        <h2>You have a new booking request!</h2>
        <p><strong>Customer:</strong> ${populated.user.name}</p>
        <p><strong>Service:</strong> ${provider.category}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Please log in to your dashboard to accept or decline this request.</p>
        <a href="http://localhost:5173/provider/dashboard">Go to Dashboard</a>
      `
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('provider', 'name category rating image hourlyRate phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('provider', 'name category rating image hourlyRate phone location')
      .populate('user', 'name phone email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the user or provider involved can view it
    if (booking.user._id.toString() !== req.user.id && booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
exports.getProviderBookings = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Provider)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify provider owns this booking
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
    };

    if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${booking.status} to ${status}` });
    }

    booking.status = status;

    if (status === 'completed') {
      booking.completedAt = new Date();
    }
    if (status === 'cancelled') {
      booking.cancelledBy = 'provider';
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name phone email')
      .populate('provider', 'name category');

    // Send email to user about status change
    await sendEmail({
      to: populated.user.email,
      subject: `Booking Update: ${status.toUpperCase()}!`,
      htmlContent: `
        <h2>Good News!</h2>
        <p>Your booking with <strong>${populated.provider.name}</strong> for <strong>${populated.provider.category}</strong> has been <strong>${status}</strong>.</p>
        <p><strong>Date:</strong> ${new Date(populated.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${populated.time}</p>
        <p>Check your dashboard for more details.</p>
        <a href="http://localhost:5173/user/dashboard">Go to Dashboard</a>
      `
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancellationReason = reason || '';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add rating & review to a completed booking
// @route   PUT /api/bookings/:id/review
// @access  Private (User)
exports.addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.rating) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    booking.rating = rating;
    booking.review = review || '';
    await booking.save();

    // Recalculate provider's average rating
    const allReviews = await Booking.find({ provider: booking.provider, rating: { $exists: true, $ne: null } });
    const avgRating = allReviews.reduce((sum, b) => sum + b.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(booking.provider, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: allReviews.length
    });

    res.json({ message: 'Review submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request completion OTP (Provider)
// @route   POST /api/bookings/:id/request-completion
// @access  Private (Provider)
exports.requestCompletion = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'email name phone');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.completionOTP = otp;
    booking.otpRequested = true;
    await booking.save();

    // 1. Send OTP to customer via Email
    await sendEmail({
      to: booking.user.email,
      subject: 'Work Completion OTP - KaamWale',
      htmlContent: `
        <h2>Work Completion Verification</h2>
        <p>Hi ${booking.user.name},</p>
        <p>The service provider has requested a completion OTP for your booking.</p>
        <p style="font-size: 24px; font-weight: bold; color: #14b8a6; letter-spacing: 4px;">${otp}</p>
        <p>Please share this OTP with the worker <strong>ONLY IF</strong> you are satisfied with the work.</p>
      `
    });

    // 2. Simulate Sending SMS (for rural/mobile users)
    if (booking.user.phone) {
      console.log(`[SMS-SIMULATION] Sending to ${booking.user.phone}: Your KaamWale verification OTP is ${otp}. Share this with the worker only after work completion.`);
    }

    res.json({ 
      message: 'OTP sent successfully', 
      phone: booking.user.phone ? `XXXXXX${booking.user.phone.slice(-4)}` : 'Email Only' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify completion OTP (Provider)
// @route   POST /api/bookings/:id/verify-completion
// @access  Private (Provider)
exports.verifyCompletion = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.completionOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    booking.status = 'completed';
    booking.otpVerified = true;
    booking.completedAt = new Date();
    await booking.save();

    // Update reliability score for provider (basic logic)
    const provider = await User.findById(booking.provider);
    const totalBookings = await Booking.countDocuments({ provider: provider._id });
    const completedBookings = await Booking.countDocuments({ provider: provider._id, status: 'completed' });
    provider.reliabilityScore = Math.round((completedBookings / totalBookings) * 100);
    await provider.save();

    res.json({ message: 'OTP verified and booking completed', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Raise a dispute (User)
// @route   POST /api/bookings/:id/dispute
// @access  Private (User)
exports.raiseDispute = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.dispute = {
      isRaised: true,
      reason,
      details,
      raisedAt: new Date(),
      status: 'pending'
    };

    await booking.save();

    res.json({ message: 'Dispute raised successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
