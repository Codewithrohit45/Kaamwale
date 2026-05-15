const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Booking = require('../models/Booking');

// Razorpay Webhook Endpoint
router.post('/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const signature = req.headers['x-razorpay-signature'];
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  try {
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      // Find local order
      const order = await Order.findOne({ orderId });
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paymentId = payment.id;
        await order.save();

        // Sync with Booking
        await Booking.findByIdAndUpdate(order.booking, { paymentStatus: 'paid' });
        console.log(`[Webhook] Order ${orderId} marked as PAID via webhook`);
      }
    }

    if (event === 'refund.processed') {
      const refund = payload.refund.entity;
      const paymentId = refund.payment_id;

      const order = await Order.findOne({ paymentId });
      if (order) {
        order.status = 'refunded';
        await order.save();
        
        await Booking.findByIdAndUpdate(order.booking, { paymentStatus: 'refunded' });
        console.log(`[Webhook] Order for payment ${paymentId} marked as REFUNDED`);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
