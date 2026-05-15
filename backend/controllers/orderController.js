const Order = require('../models/Order');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(booking.totalPrice * 100);
    const receipt = `receipt_${bookingId.substring(0, 10)}_${Date.now()}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Create local order record
    const order = await Order.create({
      user: req.user.id,
      provider: booking.provider,
      booking: bookingId,
      amount: booking.totalPrice,
      currency: 'INR',
      receipt,
      orderId: rzpOrder.id, // Razorpay Order ID
      status: 'created'
    });

    res.status(201).json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID // Send key_id to frontend
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay signature and update order status
// @route   PUT /api/orders/:id/payment
// @access  Private (User)
exports.updateOrderToPaid = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify Signature
    const body = order.orderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      order.status = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    order.paymentId = razorpay_payment_id;
    order.signature = razorpay_signature;
    order.status = 'paid';
    await order.save();

    // Update booking payment status
    await Booking.findByIdAndUpdate(order.booking, { paymentStatus: 'paid' });

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my orders
// @route   GET /api/orders/myorders
// @access  Private (User)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('provider', 'name category')
      .populate('booking', 'date time status totalPrice')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
