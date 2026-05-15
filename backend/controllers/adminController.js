const User = require('../models/User');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { processRefund } = require('./orderController');

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
      if (booking.paymentStatus === 'paid') {
        await processRefund(booking._id, 'Admin resolved dispute');
      } else {
        booking.paymentStatus = 'refunded';
      }
    } else {
      // If dismissed, keep status as is (usually in-progress or completed)
    }

    await booking.save();

    // Notify both parties
    await Notification.create({
      recipient: booking.user,
      title: 'Dispute Resolved',
      message: `Your dispute for booking #${booking._id.toString().slice(-6)} has been ${status}. Resolution: ${resolution}`,
      type: 'dispute',
      link: '/user/dashboard'
    });

    await Notification.create({
      recipient: booking.provider,
      title: 'Dispute Resolved',
      message: `The dispute for booking #${booking._id.toString().slice(-6)} has been ${status}. Resolution: ${resolution}`,
      type: 'dispute',
      link: '/provider/dashboard'
    });

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

// @desc    Review provider KYC
// @route   PUT /api/admin/users/:id/kyc
// @access  Private/Admin
const reviewKYC = async (req, res) => {
  try {
    const { status, rejectedReason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'provider') return res.status(400).json({ message: 'KYC only applies to providers' });

    user.kyc.status = status;
    user.kyc.reviewedAt = new Date();
    
    if (status === 'rejected') {
      user.kyc.rejectedReason = rejectedReason;
      user.isVerified = false;
    } else if (status === 'verified') {
      user.isVerified = true;
      user.kyc.rejectedReason = '';
    }

    await user.save();
    res.json({ message: `KYC ${status} successfully`, kyc: user.kyc, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    // 1. Total Revenue
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    // 2. Bookings by Category
    const bookings = await Booking.find().populate('provider', 'category');
    const categoryStats = {};
    bookings.forEach(b => {
      const cat = b.provider?.category || 'Other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    const categoryData = Object.keys(categoryStats).map(name => ({
      name,
      value: categoryStats[name]
    }));

    // 3. Monthly Trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const count = await Booking.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      monthlyData.push({ month: monthName, bookings: count });
    }

    res.json({
      totalRevenue,
      categoryData,
      monthlyData,
      activeUsers: await User.countDocuments({ role: 'user' }),
      activeProviders: await User.countDocuments({ role: 'provider' })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed revenue stats
// @route   GET /api/admin/revenue-stats
// @access  Private/Admin
const getRevenueStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
          _id: null,
          totalGMV: { $sum: '$totalPrice' },
          totalPlatformFee: { $sum: '$platformFee' },
          totalTax: { $sum: '$taxAmount' },
          totalCommission: { $sum: '$commissionAmount' }
      }}
    ]);

    // Daily Revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$platformFee' },
          bookings: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Category Revenue
    const categoryStats = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'providerInfo'
      }},
      { $unwind: '$providerInfo' },
      { $group: {
          _id: '$providerInfo.category',
          revenue: { $sum: '$platformFee' }
      }}
    ]);

    res.json({
      summary: stats[0] || { totalGMV: 0, totalPlatformFee: 0, totalTax: 0, totalCommission: 0 },
      dailyTrends: dailyStats,
      categoryDistribution: categoryStats.map(s => ({ name: s._id, value: s.revenue }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, maxDiscount, expiryDate } = req.body;
    const coupon = await Coupon.create({ code: code.toUpperCase(), discountPercentage, maxDiscount, expiryDate });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const { isActive } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    res.json(coupon);
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
  toggleVerification,
  reviewKYC,
  getAnalytics,
  getRevenueStats,
  getCoupons,
  createCoupon,
  updateCoupon
};
