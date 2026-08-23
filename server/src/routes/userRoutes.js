const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');


router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const search = req.query.search;
    const role = req.query.role;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit);
    
    // Add full avatar URL to each user (not needed anymore with Cloudinary absolute URLs, but keep the map logic for backwards compatibility if needed, though they'll just use it directly)
    const usersWithAvatarUrl = users.map(user => {
      const userObj = user.toObject();
      return userObj;
    });
    
    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      users: usersWithAvatarUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const userObj = user.toObject();
    
    // Add full avatar URL if avatar exists (Cloudinary URLs are already absolute)
    
    res.json({
      success: true,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userObj = user.toObject();
    
    // Add full avatar URL if avatar exists (Cloudinary URLs are already absolute)
    
    res.json({
      success: true,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.body.isActive === false) {
      const activeOrders = await Order.findOne({
        user: req.params.id,
        status: { $nin: ['delivered', 'cancelled', 'returned'] }
      });
      
      if (activeOrders) {
        return res.status(400).json({ message: 'Cannot deactivate account with active orders' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/me/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarPath = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/me', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot delete their own accounts' });
    }

    const activeOrders = await Order.findOne({
      user: req.user._id,
      status: { $nin: ['delivered', 'cancelled', 'returned'] }
    });
    
    if (activeOrders) {
      return res.status(400).json({ message: 'You cannot delete your account while you have active orders.' });
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({
      success: true,
      message: 'Your account has been deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({ message: 'Admins cannot delete their own accounts' });
    }

    const activeOrders = await Order.findOne({
      user: req.params.id,
      status: { $nin: ['delivered', 'cancelled', 'returned'] }
    });
    
    if (activeOrders) {
      return res.status(400).json({ message: 'Cannot delete account with active orders' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

