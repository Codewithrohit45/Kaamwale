const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getProviderBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBooking);

router.get('/mybookings', protect, getMyBookings);
router.get('/provider', protect, getProviderBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
