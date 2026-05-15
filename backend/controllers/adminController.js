const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users and providers
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found' });
    if (userToDelete.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' });

    // Cancel all pending bookings for this user
    await Booking.updateMany(
      { $or: [{ user: req.params.id }, { provider: req.params.id }], status: { $in: ['pending', 'accepted'] } },
      { status: 'cancelled', cancelledBy: 'admin', cancellationReason: 'User account deleted by admin' }
    );

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('provider', 'name email category')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin cancel a booking
// @route   PUT /api/admin/bookings/:id/cancel
// @access  Private/Admin
const adminCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.cancellationReason = req.body.reason || 'Cancelled by admin';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Order = require('../models/Order');

// ... (previous functions omitted for brevity in replace_file_content instruction, but they should remain)

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Revenue from paid orders
    const revenueStats = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent Activity
    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .populate('provider', 'name category')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalProviders,
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings: await Booking.countDocuments({ 'dispute.isRaised': true, 'dispute.status': 'pending' }),
      totalRevenue: revenueStats[0]?.total || 0,
      recentActivity: recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a dispute
// @route   PUT /api/admin/bookings/:id/resolve-dispute
// @access  Private/Admin
const resolveDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.dispute.isRaised) return res.status(400).json({ message: 'No dispute raised for this booking' });

    booking.dispute.status = status; // 'resolved' or 'dismissed'
    booking.dispute.resolution = resolution;
    booking.dispute.resolvedAt = new Date();

    if (status === 'resolved') {
      // If valid dispute, mark booking as cancelled or refund needed
      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
    } else {
      // If dismissed, keep status as is (usually in-progress or completed)
    }

    await booking.save();
    res.json({ message: 'Dispute resolved successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle provider verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const toggleVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'provider') return res.status(400).json({ message: 'Verification only applies to providers' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({ message: `Provider ${user.isVerified ? 'verified' : 'unverified'} successfully`, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllBookings,
  adminCancelBooking,
  getAdminStats,
  resolveDispute,
  toggleVerification
};
