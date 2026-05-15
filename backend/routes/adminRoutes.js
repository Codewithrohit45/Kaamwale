const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllBookings,
  adminCancelBooking,
  getAdminStats,
  resolveDispute,
  toggleVerification,
  reviewKYC,
  getAnalytics,
  getCoupons,
  createCoupon,
  updateCoupon
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes here are protected and restricted to admin
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/verify', toggleVerification);
router.put('/users/:id/kyc', reviewKYC);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/cancel', adminCancelBooking);
router.get('/stats', getAdminStats);
router.put('/bookings/:id/resolve-dispute', resolveDispute);
router.get('/analytics', getAnalytics);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);

module.exports = router;