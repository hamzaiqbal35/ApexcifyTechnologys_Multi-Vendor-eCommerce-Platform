const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Only one document should exist for global settings
  isGlobal: {
    type: Boolean,
    default: true,
    unique: true
  },
  shipping: {
    flatRate: {
      type: Number,
      default: 200
    },
    freeShippingThreshold: {
      type: Number,
      default: 5000
    },
    isTiered: {
      type: Boolean,
      default: true
    }
  },
  tax: {
    rate: {
      type: Number,
      default: 10 // Percentage, e.g., 10 for 10%
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
