const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const os = require('os');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const mediaFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
    return cb(new Error('Only image and video files are allowed'), false);
  }
  cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const uploadToCloudinary = (folder, options = {}) => async (req, res, next) => {
  try {
    const uploadOpts = { folder, resource_type: 'auto', ...options };
    
    const uploadFile = (filePath) => new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, uploadOpts, (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          return reject(error);
        }
        resolve(result);
      });
    });

    if (req.file) {
      const result = await uploadFile(req.file.path);
      fs.unlink(req.file.path, () => {});
      req.file.path = result.secure_url;
    } else if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadFile(file.path);
        fs.unlink(file.path, () => {});
        file.path = result.secure_url;
      });
      await Promise.all(uploadPromises);
    }
    next();
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
    const actualError = error instanceof Error ? error : new Error(error.message || JSON.stringify(error));
    next(actualError);
  }
};

const avatarMulter = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadAvatar = {
  single: (field) => [
    avatarMulter.single(field),
    uploadToCloudinary('fluxmart/avatars', { transformation: [{ width: 500, height: 500, crop: 'limit' }] })
  ]
};

const productMulter = multer({ storage, fileFilter: mediaFileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
const uploadProductImages = {
  array: (field, maxCount) => [
    productMulter.array(field, maxCount),
    uploadToCloudinary('fluxmart/products')
  ]
};

const bannerMulter = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadBanner = {
  single: (field) => [
    bannerMulter.single(field),
    uploadToCloudinary('fluxmart/banners')
  ]
};

module.exports = {
  uploadAvatar,
  uploadProductImages,
  uploadBanner
};