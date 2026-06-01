const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  size:     { type: String, default: '' },
  color:    { type: String, default: '' },
  // Full set of selected option groups (Size, Color, and any custom features)
  attributes: [{ name: { type: String }, value: { type: String } }],
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name:       { type: String, required: true },
    phone:      { type: String, required: true },
    street:     { type: String, required: true },
    city:       { type: String, required: true },
    province:   { type: String, required: true },
    postalCode: { type: String },
    country:    { type: String, default: 'Pakistan' },
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cod', 'jazzcash', 'easypaisa', 'online'],
    default: 'cod',
  },
  // Screenshot/receipt the customer uploads when paying in advance (online)
  paymentProof: { type: String, default: '' },
  paymentResult: {
    id:         String,
    status:     String,
    updateTime: String,
    email:      String,
  },
  itemsPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true },
  isPaid:        { type: Boolean, default: false },
  paidAt:        Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  trackingNumber: { type: String, default: '' },
  notes:          { type: String, default: '' },
  deliveredAt:    Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
