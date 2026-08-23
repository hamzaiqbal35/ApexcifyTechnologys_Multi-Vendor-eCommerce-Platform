const express = require('express');
const router = express.Router();
const {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

// Optional auth to check if user is admin without throwing error for public
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
       const { verifyToken } = require('../utils/jwt');
       const User = require('../models/User');
       try {
           const decoded = verifyToken(token);
           req.user = await User.findById(decoded.userId).select('-password');
       } catch (e) {
           // Ignore token error for optional auth
       }
    }
    next();
  } catch (error) {
    next();
  }
};

router.route('/')
  .get(optionalAuth, getFAQs)
  .post(protect, authorize('admin'), createFAQ);

router.route('/:id')
  .put(protect, authorize('admin'), updateFAQ)
  .delete(protect, authorize('admin'), deleteFAQ);

module.exports = router;
