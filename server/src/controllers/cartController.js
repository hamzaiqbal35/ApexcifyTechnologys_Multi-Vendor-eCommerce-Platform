const Cart = require('../models/Cart');
const Product = require('../models/Product');

const VENDOR_BULK_MIN = 10;

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    let newQuantity;
    if (existingItem) {
      newQuantity = existingItem.quantity + quantity;
    } else {
      newQuantity = quantity;
    }

    if (req.user.role === 'vendor' && newQuantity < VENDOR_BULK_MIN) {
      return res.status(400).json({
        message: `Vendors can only place bulk orders. Minimum quantity per item is ${VENDOR_BULK_MIN}.`
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: newQuantity,
        price: product.price
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const product = await Product.findById(item.product);
    if (quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (req.user.role === 'vendor' && quantity < VENDOR_BULK_MIN) {
      return res.status(400).json({
        message: `Vendors can only place bulk orders. Minimum quantity per item is ${VENDOR_BULK_MIN}.`
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.json({
      success: true,
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

