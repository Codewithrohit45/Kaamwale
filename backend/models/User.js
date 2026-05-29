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
  repeatCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
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
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  withdrawableBalance: {
    type: Number,
    default: 0,
  },
  kyc: {
    documentUrl: String,
    documentType: {
      type: String,
      enum: ['aadhaar', 'pan', 'voter_id', 'driving_license']
    },
    status: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none'
    },
    rejectedReason: String,
    submittedAt: Date,
    reviewedAt: Date
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  payoutDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    vpa: String
  },
  payoutStatus: {
    type: String,
    enum: ['not-configured', 'pending', 'verified'],
    default: 'not-configured'
  },
  locationCoords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  packages: [
    {
      name: String,
      price: Number,
      description: String,
      features: [String]
    }
  ]
}, { timestamps: true });

userSchema.index({ locationCoords: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
