const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceLocation: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
  },
  estimatedHours: {
    type: Number,
    default: 2,
  },
  notes: {
    type: String,
  },
  // Who cancelled and why
  cancelledBy: {
    type: String,
    enum: ['user', 'provider', 'admin', null],
    default: null,
  },
  cancellationReason: {
    type: String,
  },
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  // Completion details
  completedAt: {
    type: Date,
  },
  // Rating & review by user after completion
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
  // Trust & Completion Logic
  completionOTP: {
    type: String,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  otpRequested: {
    type: Boolean,
    default: false,
  },
  dispute: {
    isRaised: { type: Boolean, default: false },
    reason: { type: String },
    details: { type: String },
    raisedAt: { type: Date },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
    resolution: { type: String }
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  rescheduleRequest: {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    newDate: Date,
    newTime: String,
    reason: String,
    status: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none'
    }
  },
  workerCount: {
    type: Number,
    default: 1
  },
  isBulk: {
    type: Boolean,
    default: false
  },
  customerCoords: {
    lat: Number,
    lng: Number
  },
  workerCheckInCoords: {
    lat: Number,
    lng: Number
  },
  workerCheckOutCoords: {
    lat: Number,
    lng: Number
  },
  isLocationVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
