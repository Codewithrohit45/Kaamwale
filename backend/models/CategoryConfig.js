const mongoose = require('mongoose');

const categoryConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  basePlatformFee: {
    type: Number,
    required: true,
    default: 50
  },
  commissionPercentage: {
    type: Number,
    required: true,
    default: 10
  },
  gstPercentage: {
    type: Number,
    default: 18
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CategoryConfig', categoryConfigSchema);
