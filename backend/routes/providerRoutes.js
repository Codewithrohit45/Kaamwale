const express = require('express');
const router = express.Router();
const { getProviders, getProviderById, updateAvailability, updateProfile, getProviderReviews, getTopProviders } = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getProviders);
router.get('/top', getTopProviders);
router.put('/availability', protect, updateAvailability);
router.put('/profile', protect, updateProfile);
router.get('/:id', getProviderById);
router.get('/:id/reviews', getProviderReviews);

module.exports = router;
