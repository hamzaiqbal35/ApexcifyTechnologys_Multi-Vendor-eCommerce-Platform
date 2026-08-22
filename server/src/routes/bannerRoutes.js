const express = require('express');
const router = express.Router();
const { getBanners, getAdminBanners, createBanner, deleteBanner, updateBanner } = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure banners directory exists
const bannersDir = path.join(__dirname, '../../uploads/banners');
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

// Multer config for banner uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/banners/');
  },
  filename(req, file, cb) {
    cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Images only!');
    }
  }
});

router.route('/')
  .get(getBanners)
  .post(protect, authorize('admin'), upload.single('image'), createBanner);

router.route('/admin')
  .get(protect, authorize('admin'), getAdminBanners);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteBanner)
  .put(protect, authorize('admin'), upload.single('image'), updateBanner);

module.exports = router;
