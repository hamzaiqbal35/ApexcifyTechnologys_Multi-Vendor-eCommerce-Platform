const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files under server/uploads/avatars so they are served by app.js
    const dir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = {
  uploadAvatar
};


