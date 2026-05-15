const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
  },
  image: {
    type: String,
  },
  // Fields specific to providers
  category: {
    type: String,
  },
  hourlyRate: {
    type: Number,
  },
  location: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  unavailableDates: [{
    type: String
  }],
  workingHours: {
    type: [String],
    default: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM']
  },
  blockedSlots: [{
    date: String,
    time: String
  }],
  reviewsCount: {
    type: Number,
    default: 0,
  },
  // Trust & Reliability Fields
  reliabilityScore: {
    type: Number,
    default: 100,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  trustBadges: {
    type: [String],
    default: [],
  },
  completedBookings: {
    type: Number,
    default: 0,
  },
  cancelledBookings: {
    type: Number,
    default: 0,
  },
  repeatCustomerRate: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
