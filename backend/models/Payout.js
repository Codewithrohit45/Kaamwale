const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'upi'],
    default: 'bank_transfer'
  },
  payoutDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    vpa: String // UPI ID
  },
  referenceId: String, // From Razorpay X
  adminComments: String,
  failureReason: String,
  processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
