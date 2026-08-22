const Banner = require('../models/Banner');

// @desc    Get all banners (public)
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
exports.getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, link, isActive, order, textColor } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      imageUrl,
      link,
      textColor,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order) : 0
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    await banner.deleteOne();
    res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { title, subtitle, link, isActive, order, textColor } = req.body;
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    let imageUrl = banner.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    banner.title = title !== undefined ? title : banner.title;
    banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
    banner.link = link !== undefined ? link : banner.link;
    banner.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : banner.isActive;
    banner.order = order !== undefined ? parseInt(order) : banner.order;
    banner.textColor = textColor !== undefined ? textColor : banner.textColor;
    banner.imageUrl = imageUrl;

    await banner.save();
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
