const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/all', authorize('admin', 'vendor'), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('admin', 'vendor'), updateOrderStatus);

module.exports = router;

