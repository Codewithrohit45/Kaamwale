const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendOtp } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;

module.exports = router;
