const express = require('express');
const router = express.Router();
const { getProviders, getProviderById, updateAvailability, updateProfile, getProviderReviews, getTopProviders, submitKYC } = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProviders);
router.get('/top', getTopProviders);
router.put('/availability', protect, updateAvailability);
router.put('/profile', protect, updateProfile);
router.put('/kyc', protect, submitKYC);
router.get('/:id', getProviderById);
router.get('/:id/reviews', getProviderReviews);

module.exports = router;
