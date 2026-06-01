const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  salePrice:   { type: Number, default: null },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images:      [{ type: String }],           // Cloudinary URLs
  sizes:       [{ type: String }],           // e.g. ['S','M','L','XL','XXL','Free Size']
  colors:      [{ type: String }],           // e.g. ['White', 'Black', 'Green']
  // Extra admin-defined option groups, e.g. { name: 'Fabric', options: ['Cotton','Wool'] }
  features:    [{ name: { type: String }, options: [{ type: String }] }],
  material:    { type: String, default: '' },
  stock:       { type: Number, required: true, default: 0 },
  sku:         { type: String, default: '' },
  tags:        [{ type: String }],
  featured:    { type: Boolean, default: false },
  onHeader:    { type: Boolean, default: false },  // show in homepage top carousel
  isActive:    { type: Boolean, default: true },
  reviews:     [reviewSchema],
  rating: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 10) / 10,
  },
  numReviews:  { type: Number, default: 0 },
  soldCount:   { type: Number, default: 0 },
}, { timestamps: true });

// Auto-update rating when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = total / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
