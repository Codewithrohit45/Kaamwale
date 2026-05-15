const Booking = require('../models/Booking');
const User = require('../models/User');
const CategoryConfig = require('../models/CategoryConfig');
const Notification = require('../models/Notification');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendEmail } = require('../utils/emailService');
const { processRefund } = require('./orderController');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = async (req, res) => {
  try {
    const { providerId, serviceLocation, date, time, notes, estimatedHours, workerCount = 1, customerCoords } = req.body;

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
    const basePrice = (provider.hourlyRate || 300) * hours;
    const totalPrice = (basePrice * workerCount) + 50; 

    // Fake Booking Prevention
    const pendingCount = await Booking.countDocuments({ user: req.user.id, status: 'pending' });
    if (pendingCount >= 3) {
      return res.status(400).json({ message: 'Too many pending bookings. Please wait for them to be accepted or completed.' });
    }

    // Suspicious Activity Detection
    const user = await User.findById(req.user.id);
    const userTotal = await Booking.countDocuments({ user: req.user.id });
    const userCancelled = await Booking.countDocuments({ user: req.user.id, status: 'cancelled', cancelledBy: 'user' });
    if (userTotal > 5 && (userCancelled / userTotal) > 0.5) {
      return res.status(403).json({ message: 'Your account has been flagged for unusual cancellation activity. Please contact support.' });
    }

    const config = await CategoryConfig.findOne({ name: provider.category });
    const platformFee = config ? config.basePlatformFee : 50;

    const hours = parseInt(estimatedHours) || 2;
    const workerCountInt = parseInt(workerCount);
    const basePrice = (provider.hourlyRate || 300) * hours * workerCountInt;
    const totalPrice = basePrice + platformFee;

    const booking = await Booking.create({
      user: req.user.id,
      provider: providerId,
      serviceLocation,
      date,
      time,
      notes,
      estimatedHours: hours,
      workerCount: workerCountInt,
      isBulk: workerCountInt > 1,
      customerCoords,
      platformFee,
      totalPrice,
      status: 'pending',
      isEmergency: req.body.isEmergency || false
    });

    const populated = await Booking.findById(booking._id)
      .populate('provider', 'name category rating image hourlyRate')
      .populate('user', 'name phone email');

    // Create persistent notification for provider
    await Notification.create({
      recipient: providerId,
      sender: req.user.id,
      title: 'New Booking Request',
      message: `${populated.user.name} requested your ${provider.category} service for ${new Date(date).toLocaleDateString()}.`,
      type: 'booking',
      link: '/provider/dashboard'
    });

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

// Helper for distance calculation (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// @desc    Update booking status (Provider)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, workerCoords } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify provider owns this booking
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // GPS Check-in logic for starting work
    if (status === 'in-progress') {
      if (!workerCoords || !workerCoords.lat || !workerCoords.lng) {
        return res.status(400).json({ message: 'GPS location is required to start work.' });
      }

      if (booking.customerCoords && booking.customerCoords.lat) {
        const dist = getDistance(
          booking.customerCoords.lat, booking.customerCoords.lng,
          workerCoords.lat, workerCoords.lng
        );

        if (dist > 0.5) { // 500 meters
          return res.status(400).json({ message: `Check-in failed. You are ${(dist * 1000).toFixed(0)}m away from the location. Please be on-site to start.` });
        }
        booking.isLocationVerified = true;
        booking.workerCheckInCoords = workerCoords;
      }
    }

    booking.status = status;

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
      if (booking.paymentStatus === 'paid') {
        await processRefund(booking._id, 'Provider cancelled after payment');
      }
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name phone email')
      .populate('provider', 'name category');

    // Create persistent notification for user
    await Notification.create({
      recipient: populated.user._id,
      sender: req.user.id,
      title: 'Booking Update',
      message: `Your booking with ${populated.provider.name} has been ${status}.`,
      type: 'booking',
      link: '/user/dashboard'
    });

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

    const populated = await Booking.findById(booking._id).populate('user', 'name');

    // Create notification for provider
    await Notification.create({
      recipient: booking.provider,
      sender: req.user.id,
      title: 'Booking Cancelled',
      message: `${populated.user.name} has cancelled their booking. Reason: ${reason || 'Not provided'}`,
      type: 'booking',
      link: '/provider/dashboard'
    });

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

    // Create persistent notification for customer
    await Notification.create({
      recipient: booking.user._id,
      sender: req.user.id,
      title: 'Work Completion OTP',
      message: `The provider has requested completion. Your OTP is: ${otp}. Share it only if work is complete.`,
      type: 'booking',
      link: '/user/dashboard'
    });

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

    // Update reliability score & Earnings for provider
    const provider = await User.findById(booking.provider);
    const totalBookingsCount = await Booking.countDocuments({ provider: provider._id });
    const completedBookingsCount = await Booking.countDocuments({ provider: provider._id, status: 'completed' });
    
    provider.reliabilityScore = Math.round((completedBookingsCount / totalBookingsCount) * 100);
    
    // Repeat Customer Tracking
    if (!provider.repeatCustomers.includes(booking.user)) {
      provider.repeatCustomers.push(booking.user);
    }
    provider.repeatCustomerRate = Math.round((provider.repeatCustomers.length / completedBookingsCount) * 100);

    // Trusted Badge Logic
    if (completedBookingsCount >= 5 && provider.reliabilityScore >= 95) {
      if (!provider.trustBadges.includes('Trusted Local Worker')) {
        provider.trustBadges.push('Trusted Local Worker');
      }
    }

    // Earnings Logic: Provider gets 90% of total price
    const providerShare = Math.round(booking.totalPrice * 0.9);
    provider.totalEarnings += providerShare;
    provider.withdrawableBalance += providerShare;
    provider.completedBookings = completedBookingsCount;

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

    const populated = await Booking.findById(booking._id).populate('user', 'name');

    // Create notification for provider
    await Notification.create({
      recipient: booking.provider,
      sender: req.user.id,
      title: 'Dispute Raised',
      message: `${populated.user.name} has raised a dispute for your booking. Reason: ${reason}`,
      type: 'dispute',
      link: '/provider/dashboard'
    });

    res.json({ message: 'Dispute raised successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request rescheduling
// @route   PUT /api/bookings/:id/reschedule-request
// @access  Private
exports.requestReschedule = async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user provider', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Only user or provider can request
    if (booking.user._id.toString() !== req.user.id && booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.rescheduleRequest = {
      requestedBy: req.user.id,
      newDate,
      newTime,
      reason,
      status: 'pending'
    };

    await booking.save();

    const recipientId = booking.user._id.toString() === req.user.id ? booking.provider._id : booking.user._id;
    
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      title: 'Reschedule Request',
      message: `${req.user.name} requested to move the booking to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
      type: 'booking',
      link: req.user.role === 'provider' ? '/user/dashboard' : '/provider/dashboard'
    });

    res.json({ message: 'Reschedule request sent', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to rescheduling
// @route   PUT /api/bookings/:id/reschedule-respond
// @access  Private
exports.respondToReschedule = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const booking = await Booking.findById(req.params.id);

    if (!booking || !booking.rescheduleRequest || booking.rescheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending reschedule request found' });
    }

    // Ensure the responder is NOT the one who requested
    if (booking.rescheduleRequest.requestedBy.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot respond to your own request' });
    }

    booking.rescheduleRequest.status = status;

    if (status === 'accepted') {
      booking.date = booking.rescheduleRequest.newDate;
      booking.time = booking.rescheduleRequest.newTime;
    }

    await booking.save();

    const recipientId = booking.rescheduleRequest.requestedBy;
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      title: `Reschedule ${status.toUpperCase()}`,
      message: `${req.user.name} has ${status} your request to reschedule.`,
      type: 'booking',
      link: req.user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'
    });

    res.json({ message: `Reschedule ${status} successfully`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download PDF Invoice
// @route   GET /api/bookings/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('provider', 'name hourlyRate category');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if user is part of the booking
    if (booking.user._id.toString() !== req.user.id && booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking._id}.pdf`);

    generateInvoice(booking, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
