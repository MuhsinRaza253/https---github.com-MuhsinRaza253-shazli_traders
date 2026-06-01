const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  showInNav:   { type: Boolean, default: true }, // show in the site header nav
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
