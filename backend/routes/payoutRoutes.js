const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  updatePayoutDetails,
  requestWithdrawal,
  getMyPayouts,
  getAllPayoutRequests,
  processPayout
} = require('../controllers/payoutController');

// Provider Routes
router.put('/details', protect, updatePayoutDetails);
router.post('/request', protect, requestWithdrawal);
router.get('/my-payouts', protect, getMyPayouts);

// Admin Routes
router.get('/admin/requests', protect, isAdmin, getAllPayoutRequests);
router.put('/admin/:id/process', protect, isAdmin, processPayout);

module.exports = router;
