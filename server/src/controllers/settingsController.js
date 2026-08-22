const Settings = require('../models/Settings');

// Helper to ensure a settings document exists
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ isGlobal: true });
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get global settings (public for frontend shipping calculation)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { shipping, tax } = req.body;
    let settings = await getOrCreateSettings();

    if (shipping) {
      settings.shipping = { ...settings.shipping, ...shipping };
    }
    
    if (tax) {
      settings.tax = { ...settings.tax, ...tax };
    }

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
