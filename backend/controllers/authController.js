const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  const { email, phone } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Save to DB
    await Otp.create({ email, otp: hashedOtp });

    console.log(`\n========================================`);
    console.log(`[KAAMWALE OTP] Code for ${email}: ${otp}`);
    if (phone) {
      console.log(`[SMS-SIMULATION] Sending to ${phone}: Your KaamWale signup OTP is ${otp}. Please do not share it with anyone.`);
    }
    console.log(`========================================\n`);

    // Send Email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Kaamwale Verification',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@kaamwale.com'
        },
        to: [{ email: email }],
        subject: 'Your Kaamwale Verification Code',
        htmlContent: `<h2>Welcome to Kaamwale!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      // We still return 200 so you can test the UI using the code from the terminal
      return res.status(200).json({ 
        message: 'Email API failed, but you can find the OTP in your backend terminal!',
        warning: errorData
      });
    }

    res.status(200).json({ 
      message: 'OTP sent successfully', 
      channel: phone ? 'Email & SMS' : 'Email Only' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone, category, hourlyRate, location, otp } = req.body;

  try {
    // Verify OTP first
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, check if user exists just in case
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      category,
      hourlyRate,
      location,
      isVerified: true
    });

    // Delete OTP record after successful registration
    await Otp.deleteMany({ email });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Save to DB
    await Otp.create({ email, otp: hashedOtp });

    console.log(`\n========================================`);
    console.log(`[KAAMWALE RESET] Password reset code for ${email}: ${otp}`);
    console.log(`========================================\n`);

    // Send Email via Brevo API
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Kaamwale Password Reset',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@kaamwale.com'
          },
          to: [{ email: email }],
          subject: 'Reset Your Kaamwale Password',
          htmlContent: `<h2>Password Reset Request</h2><p>Your password reset code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p><p>If you didn't request this, you can safely ignore this email.</p>`
        })
      });

      if (!response.ok) {
        console.error('Brevo API Error for password reset');
      }
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.status(200).json({ message: 'Password reset OTP sent. Check your email or backend terminal.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending reset OTP' });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete OTP record
    await Otp.deleteMany({ email });

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      image: user.image,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.image = req.body.image || user.image;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
