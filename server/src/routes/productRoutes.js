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
const { isVerifiedVendor } = require('../middleware/isVerifiedVendor');
const { uploadProductImages } = require('../middleware/upload');

// Admin route - Get all products (including inactive)
// IMPORTANT: This must come BEFORE '/:id' route to avoid conflicts
router.get('/admin/all', protect, authorize('admin'), getAllProductsAdmin);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Vendor-only: Create product
router.post(
  '/',
  protect,
  authorize('vendor'),
  isVerifiedVendor,
  createProduct
);

// Product image upload (vendor only)
router.post(
  '/upload-images',
  protect,
  authorize('vendor'),
  isVerifiedVendor,
  uploadProductImages.array('images', 5),
  uploadImages
);

// Add product review: any logged-in user
router.post('/:id/reviews', protect, addReview);

// Middleware: Admin or Vendor only
const adminOrVendor = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'vendor') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Not authorized to access this route'
  });
};

// Update product (admin or vendor)
router.put(
  '/:id',
  protect,
  adminOrVendor,
  updateProduct
);

// Delete product (admin or vendor)
router.delete(
  '/:id',
  protect,
  adminOrVendor,
  deleteProduct
);

module.exports = router;