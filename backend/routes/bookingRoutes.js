const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  addReview,
  requestCompletion,
  verifyCompletion,
  raiseDispute,
  requestReschedule,
  respondToReschedule,
  downloadInvoice
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/provider', protect, getProviderBookings);
router.get('/:id', protect, getBookingById);
router.get('/:id/invoice', protect, downloadInvoice);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/review', protect, addReview);

// Trust & Safety Routes
router.post('/:id/request-completion', protect, requestCompletion);
router.post('/:id/verify-completion', protect, verifyCompletion);
router.post('/:id/dispute', protect, raiseDispute);
router.put('/:id/reschedule-request', protect, requestReschedule);
router.put('/:id/reschedule-respond', protect, respondToReschedule);

module.exports = router;
