const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateUpdateOrder, validateCancelOrder } = require('../middleware/orderValidation');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/all', authorize('admin', 'vendor'), getAllOrders);
router.get('/:id', getOrder);

// New routes for edit and cancel
router.put('/:id', validateUpdateOrder, updateOrder);
router.put('/:id/cancel', validateCancelOrder, cancelOrder);

// Existing routes
router.put('/:id/status', authorize('admin', 'vendor'), updateOrderStatus);

module.exports = router;

