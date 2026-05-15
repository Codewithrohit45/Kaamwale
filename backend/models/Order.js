const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  receipt: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String, // From Payment Gateway (e.g. Razorpay payment_id)
  },
  orderId: {
    type: String, // From Payment Gateway (e.g. Razorpay order_id)
  },
  signature: {
    type: String, // For payment verification
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
    default: 'created',
  },
  notes: {
    type: Map,
    of: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
