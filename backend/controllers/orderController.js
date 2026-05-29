const Order = require('../models/Order');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Coupon = require('../models/Coupon');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// @desc    Create a Razorpay order
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let finalPrice = booking.totalPrice;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true, 
        expiryDate: { $gte: new Date() } 
      });
      if (coupon) {
        discountAmount = Math.min((finalPrice * coupon.discountPercentage) / 100, coupon.maxDiscount);
        finalPrice -= discountAmount;
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(finalPrice * 100);
    const receipt = `receipt_${bookingId.substring(0, 10)}_${Date.now()}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
    };

    let rzpOrder;
    const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder');
    
    if (isMockMode) {
      rzpOrder = { id: `order_mock_${Math.random().toString(36).substring(2, 11)}` };
    } else {
      rzpOrder = await razorpay.orders.create(options);
    }

    // Create local order record
    const order = await Order.create({
      user: req.user.id,
      provider: booking.provider,
      booking: bookingId,
      amount: finalPrice,
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
    const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder') || razorpay_payment_id.startsWith('pay_mock');
    let isSignatureValid = false;
    
    if (isMockMode) {
      isSignatureValid = true;
    } else {
      const body = order.orderId + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
      isSignatureValid = expectedSignature === razorpay_signature;
    }

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
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process refund via Razorpay
// @access  Internal/Controller
exports.processRefund = async (bookingId, reason = 'Cancelled by system') => {
  try {
    const order = await Order.findOne({ booking: bookingId, status: 'paid' });
    if (!order) return { success: false, message: 'No paid order found' };

    const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder') || order.paymentId.startsWith('pay_mock');
    let refundId;

    if (isMockMode) {
      refundId = `ref_mock_${Math.random().toString(36).substring(2, 11)}`;
    } else {
      const refund = await razorpay.payments.refund(order.paymentId, {
        amount: Math.round(order.amount * 100), // Full refund
        notes: { reason, bookingId: bookingId.toString() }
      });
      refundId = refund.id;
    }

    order.status = 'refunded';
    await order.save();

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'refunded' });

    return { success: true, refundId };
  } catch (error) {
    console.error('Razorpay Refund Error:', error);
    return { success: false, error: error.message };
  }
};
