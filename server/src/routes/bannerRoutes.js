const express = require('express');
const router = express.Router();
const { getBanners, getAdminBanners, createBanner, deleteBanner, updateBanner } = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');

router.route('/')
  .get(getBanners)
  .post(protect, authorize('admin'), uploadBanner.single('image'), createBanner);

router.route('/admin')
  .get(protect, authorize('admin'), getAdminBanners);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteBanner)
  .put(protect, authorize('admin'), uploadBanner.single('image'), updateBanner);

module.exports = router;
