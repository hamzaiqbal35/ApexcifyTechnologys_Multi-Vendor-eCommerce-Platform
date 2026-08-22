const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
  },
  textColor: {
    type: String,
    default: '#000000',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
