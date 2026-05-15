const express = require('express');
const router = express.Router();
const { createOrder, updateOrderToPaid, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/payment', protect, updateOrderToPaid);

module.exports = router;
