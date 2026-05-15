const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendOtp, forgotPassword, resetPassword, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
