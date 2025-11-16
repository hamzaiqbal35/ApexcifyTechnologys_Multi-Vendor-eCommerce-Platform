const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Group items by vendor
    const itemsByVendor = {};
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const vendorId = product.vendor.toString();
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = [];
      }

      itemsByVendor[vendorId].push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        vendor: vendorId
      });

      itemsPrice += product.price * item.quantity;
    }

    // Create orders for each vendor
    const orders = [];
    for (const vendorId in itemsByVendor) {
      const orderItems = itemsByVendor[vendorId];
      const orderItemsPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingPrice = 10; // Fixed shipping price
      const taxPrice = orderItemsPrice * 0.1; // 10% tax
      const totalPrice = orderItemsPrice + shippingPrice + taxPrice;

      const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: orderItemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        status: 'pending'
      });

      // Update product stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      orders.push(order);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, orders);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      orders
    });
  } catch (error) {
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
      .populate('orderItems.vendor', 'name vendorInfo.businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .populate('orderItems.vendor', 'name email vendorInfo.businessName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized
    if (order.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        !order.orderItems.some(item => item.vendor._id.toString() === req.user._id.toString())) {
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
// @access  Private/Vendor/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isVendor = order.orderItems.some(
      item => item.vendor.toString() === req.user._id.toString()
    );

    if (!isVendor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send status update email
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

// @desc    Get all orders (Admin/Vendor)
// @route   GET /api/orders/all
// @access  Private/Admin/Vendor
const getAllOrders = async (req, res) => {
  try {
    let query = {};

    // If vendor, only show their orders
    if (req.user.role === 'vendor') {
      query = { 'orderItems.vendor': req.user._id };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .populate('orderItems.vendor', 'name vendorInfo.businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
};

