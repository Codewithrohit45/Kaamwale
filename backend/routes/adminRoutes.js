const express = require('express');
const router = express.Router();
const { getAllUsers, getAllBookings, getAdminStats } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/users', protect, isAdmin, getAllUsers);
router.get('/bookings', protect, isAdmin, getAllBookings);
router.get('/stats', protect, isAdmin, getAdminStats);

module.exports = router;
