const express = require('express');
const router = express.Router();
const {
  getProducts,
  getAllProductsAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  uploadImages
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');

// Admin route - Get all products (including inactive)
// IMPORTANT: This must come BEFORE '/:id' route to avoid conflicts
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin-only: Create product
router.post(
  '/',
  protect,
  authorize('admin'),
  createProduct
);

// Product image upload (admin only)
router.post(
  '/upload-images',
  protect,
  authorize('admin'),
  uploadProductImages.array('images', 5),
  uploadImages
);

// Add product review: any logged-in user
router.post('/:id/reviews', protect, addReview);

// Update product (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateProduct
);

// Delete product (admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

module.exports = router;