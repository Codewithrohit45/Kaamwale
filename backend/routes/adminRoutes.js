const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllBookings,
  adminCancelBooking,
  getAdminStats,
  resolveDispute,
  toggleVerification
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes here are protected and restricted to admin
router.use(protect);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/verify', toggleVerification);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/cancel', adminCancelBooking);
router.get('/stats', getAdminStats);
router.put('/bookings/:id/resolve-dispute', resolveDispute);

module.exports = router;