const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, isDeleted: { $ne: true } };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (including inactive) - Admin only
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isDeleted: { $ne: true } }; // Exclude soft-deleted products, allow older ones

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, tags } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      stock,
      tags
    });

    const populatedProduct = await Product.findById(product._id);

    res.status(201).json({
      success: true,
      product: populatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if status is being toggled and if there's a reason
    if (req.body.isActive !== undefined && req.body.isActive !== product.isActive) {
      if (!req.body.reason && !req.body.isActive) {
        return res.status(400).json({ message: 'Reason is required when deactivating a product' });
      }
      if (req.body.reason) {
        product.actionLogs.push({
          action: req.body.isActive ? 'activate' : 'deactivate',
          reason: req.body.reason,
          user: req.user._id
        });
      }
    }

    // Remove reason from body so it doesn't get saved as a product field
    const updateData = { ...req.body };
    delete updateData.reason;

    // Use Object.assign instead of findByIdAndUpdate to trigger hooks if any, and keep the pushed logs
    Object.assign(product, updateData);
    await product.save();

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required for deletion' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    product.isDeleted = true;
    product.isActive = false;
    product.actionLogs.push({
      action: 'delete',
      reason: reason,
      user: req.user._id
    });

    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Manage product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Admin)
const manageStock = async (req, res) => {
  try {
    const { action, quantity, reason } = req.body;
    
    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Valid action (add/remove) is required' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (action === 'remove' && product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock to remove' });
    }

    product.stock = action === 'add' ? product.stock + Number(quantity) : product.stock - Number(quantity);
    
    product.actionLogs.push({
      action: action === 'add' ? 'add_stock' : 'remove_stock',
      reason: reason,
      quantityChanged: quantity,
      user: req.user._id
    });

    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload product images
// @route   POST /api/products/upload-images
// @access  Private/Admin
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      images: imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getAllProductsAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  manageStock,
  addReview,
  uploadImages
};