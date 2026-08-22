const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processStripeRefund = async (order) => {
  if (order.paymentMethod === 'stripe' && order.isPaid && order.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
      order.isRefunded = true;
      order.refundedAt = new Date();
      order.isPaid = false;
      order.paidAt = null;
    } catch (error) {
      console.error('Stripe refund failed:', error.message);
      throw new Error(`Refund failed: ${error.message}`);
    }
  } else if (order.isPaid) {
    // Fallback for COD or if no intent ID, just mark it conceptually
    order.isRefunded = true;
    order.refundedAt = new Date();
    order.isPaid = false;
    order.paidAt = null;
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const session = isProduction ? await mongoose.startSession() : null;
  
  if (isProduction) {
    session.startTransaction();
  }

  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cartQuery = Cart.findOne({ user: req.user._id }).populate('items.product');
    if (isProduction) cartQuery.session(session);
    const cart = await cartQuery;

    if (!cart || cart.items.length === 0) {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const productQuery = Product.findById(item.product._id);
      if (isProduction) productQuery.session(session);
      const productDoc = await productQuery;

      if (!productDoc) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({ message: `Product not found: ${item.product._id}` });
      }

      if (!productDoc.isActive) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({ message: `Product ${productDoc.name} is no longer active` });
      }

      // Atomic check and decrement for stock
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        isProduction ? { new: true, session } : { new: true }
      );

      if (!updatedProduct) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          message: `Insufficient stock for ${productDoc.name}`
        });
      }

      orderItems.push({
        product: productDoc._id,
        name: productDoc.name,
        image: productDoc.images[0] || '',
        price: productDoc.price,
        quantity: item.quantity
      });

      itemsPrice += productDoc.price * item.quantity;
    }

    // Fetch dynamic shipping settings
    const Settings = require('../models/Settings');
    const settingsQuery = Settings.findOne({ isGlobal: true });
    if (isProduction) settingsQuery.session(session);
    const settings = await settingsQuery;
    
    let shippingPrice = 10; // default fallback
    if (settings && settings.shipping) {
      if (settings.shipping.isTiered && itemsPrice >= settings.shipping.freeShippingThreshold) {
        shippingPrice = 0; // Free shipping
      } else {
        shippingPrice = settings.shipping.flatRate;
      }
    }

    let taxRate = 0.1;
    if (settings && settings.tax && settings.tax.rate !== undefined) {
      taxRate = settings.tax.rate / 100;
    }
    const taxPrice = itemsPrice * taxRate;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const isPaid = !!req.body.stripePaymentIntentId;
    const paidAt = isPaid ? new Date() : undefined;

    const [order] = await Order.create([{
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      stripePaymentIntentId: req.body.stripePaymentIntentId, // Handle stripe
      isPaid,
      paidAt,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: 'pending'
    }], isProduction ? { session } : {});

    cart.items = [];
    await cart.save(isProduction ? { session } : {});

    if (isProduction) {
      await session.commitTransaction();
      session.endSession();
    }

    try {
      await sendOrderConfirmationEmail(req.user.email, [order]);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      orders: [order]
    });
  } catch (error) {
    if (isProduction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order (customer updates items before shipping)
const updateOrder = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const session = isProduction ? await mongoose.startSession() : null;

  if (isProduction) {
    session.startTransaction();
  }

  try {
    const { id } = req.params;
    const { orderItems } = req.body;
    const userId = req.user._id;

    // Find the order with the current items
    const order = await Order.findById(id)
      .populate('orderItems.product');

    if (!order) {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (order.status !== 'pending') {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ message: 'Can only edit pending orders' });
    }

    if (order.isPaid || order.isShipped) {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ message: 'Cannot edit paid or shipped orders' });
    }

    if (!orderItems || orderItems.length === 0) {
      if (isProduction) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Create a map of current order items for quick lookup
    const currentItems = new Map();
    order.orderItems.forEach(item => {
      if (item.product && item.product._id) {
        currentItems.set(item.product._id.toString(), {
          quantity: item.quantity,
          product: item.product
        });
      }
    });

    let itemsPrice = 0;
    const updatedOrderItems = [];
    const productUpdates = [];

    // First pass: Calculate stock changes
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      const currentQty = currentItems.get(item.product)?.quantity || 0;
      const newQty = item.quantity;

      // Calculate the actual change in quantity
      const quantityChange = newQty - currentQty;

      // Verify stock is sufficient for ADDITIONS only
      if (quantityChange > 0 && product.stock < quantityChange) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }

      if (newQty < 1) {
        if (isProduction) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({ message: 'Item quantity must be at least 1' });
      }

      // Store the update
      if (quantityChange !== 0) {
        productUpdates.push({
          productId: product._id,
          stockChange: -quantityChange, // Negative of quantity change (adding to order = reducing stock)
          currentQty,
          newQty
        });
      }

      updatedOrderItems.push({
        name: product.name,
        quantity: newQty,
        image: product.image || (product.images && product.images[0]) || '',
        price: product.price,
        product: product._id
      });

      itemsPrice += product.price * newQty;
    }

    // Handle items that were removed from the order (not in new orderItems)
    for (const [productId, itemData] of currentItems.entries()) {
      const stillInOrder = orderItems.some(item => item.product === productId);
      if (!stillInOrder) {
        // Item was removed entirely - restore stock
        productUpdates.push({
          productId: productId,
          stockChange: itemData.quantity, // Return the quantity back to stock
          currentQty: itemData.quantity,
          newQty: 0
        });
      }
    }

    // Second pass: Apply stock updates
    for (const update of productUpdates) {
      const updateQuery = Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: update.stockChange } },
        isProduction ? { session } : {}
      );
      await updateQuery;
    }

    // Update order
    const Settings = require('../models/Settings');
    const settingsQuery = Settings.findOne({ isGlobal: true });
    if (isProduction) settingsQuery.session(session);
    const settings = await settingsQuery;

    let taxRate = 0.1;
    if (settings && settings.tax && settings.tax.rate !== undefined) {
      taxRate = settings.tax.rate / 100;
    }
    
    const taxPrice = itemsPrice * taxRate;
    const shippingPrice = order.shippingPrice;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    order.orderItems = updatedOrderItems;
    order.itemsPrice = itemsPrice;
    order.taxPrice = taxPrice;
    order.totalPrice = totalPrice;

    if (isProduction) {
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      await order.save();
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    if (isProduction && session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (before shipping)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership or admin status
    const isAdmin = req.user.role === 'admin';
    const isOrderOwner = order.user.toString() === userId.toString();

    if (!isOrderOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Customer can only cancel if PENDING
    if (isOrderOwner && !isAdmin && order.status !== 'pending') {
      return res.status(400).json({
        message: 'Customers can only cancel pending orders. Please contact support.'
      });
    }

    // Admin can cancel if not shipped/delivered
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // MARK ORDER AS CANCELLED
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();

    // Process Refund
    await processStripeRefund(order);

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images stock');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courier, estimatedDeliveryDate, reason } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'email name');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot update status of cancelled orders'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transitions
    const validNextStatuses = Order.VALID_TRANSITIONS[order.status];
    if (!validNextStatuses) {
      return res.status(400).json({
        message: `Invalid current status: ${order.status}`
      });
    }

    if (!validNextStatuses.includes(status) && order.status !== status) {
      return res.status(400).json({
        message: `Cannot transition order status from '${order.status}' to '${status}'. Valid next states are: ${validNextStatuses.join(', ') || 'none'}`
      });
    }

    // Validate shipping info if status is shipped
    if (status === 'shipped') {
      if (!trackingNumber || !courier || !estimatedDeliveryDate) {
        // Only enforce if it's a new shipment or updating details
        // But for simplicity, let's enforce it if they are transitioning to shipped
        if (order.status !== 'shipped') {
          return res.status(400).json({
            message: 'Tracking number, courier, and estimated delivery date are required for shipped status'
          });
        }
      }
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courier) order.courier = courier;
      if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    // Update status
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (status === 'cancelled') {
      if (!reason || reason.trim().length < 5) {
        return res.status(400).json({
          message: 'Cancellation reason is required and must be at least 5 characters long'
        });
      }
      
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      
      
      await processStripeRefund(order);

      // Restore product stock when order is cancelled
      for (const item of order.orderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: item.quantity } }
          );
        }
      }
    } else if (status === 'returned') {
      await processStripeRefund(order);
      order.returnedAt = new Date();

      // Restore product stock when order is returned
      for (const item of order.orderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: item.quantity } }
          );
        }
      }
    }

    await order.save();

    try {
      await sendOrderStatusUpdateEmail(order.user.email, order);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {};
    const count = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle payment status
// @route   PUT /api/orders/:id/pay
// @access  Private (admin)
const updateOrderPaymentToggle = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prevent payment status changes on cancelled orders
    if (order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot update payment status of cancelled orders'
      });
    }

    // Payment can only be marked after Delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        message: 'Payment can only be marked after order is delivered'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can mark payment' });
    }

    order.isPaid = !order.isPaid;
    order.paidAt = order.isPaid ? Date.now() : null;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fix inconsistent order data (utility function for admins)
// @route   PUT /api/orders/:id/fix-consistency
// @access  Private (admin only)
const fixOrderConsistency = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Fixing consistency is now fully handled by the pre-save hook in the Order model.
    // By simply calling order.save(), the pre-save hook will re-evaluate the main status
    // and correctly set isShipped, isDelivered, etc.
    // To trigger it, we need to mark status as modified if it wasn't.
    order.markModified('status');

    await order.save();

    res.json({
      success: true,
      message: 'Order consistency fixed (handled by model pre-save hook)',
      changes: {
        before: originalStatus,
        after: order
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Request a return for a delivered order
// @route   PUT /api/orders/:id/return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: 'Return reason is required (min 5 characters)' });
    }

    order.status = 'return_requested';
    order.returnReason = reason;
    await order.save();

    res.json({ success: true, message: 'Return requested successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
  getAllOrders,
  updateOrderPaymentToggle,
  fixOrderConsistency
};