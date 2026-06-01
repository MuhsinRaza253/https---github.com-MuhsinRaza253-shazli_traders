const mongoose = require('mongoose');

// Single store-wide settings document (singleton). Holds the manual payment
// (bank/wallet) details shown to customers paying in advance, and the
// configurable delivery charges.
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true }, // ensures a single doc

  // --- Manual / advance payment account details ---
  bankName:            { type: String, default: '' },
  accountTitle:        { type: String, default: '' },
  accountNumber:       { type: String, default: '' },
  iban:                { type: String, default: '' },
  paymentInstructions: { type: String, default: '' },

  // --- Delivery charges ---
  deliveryCharge:         { type: Number, default: 200 },  // flat charge (PKR)
  freeShippingThreshold:  { type: Number, default: 3000 }, // 0 = never free

  // --- Storefront contact details (shown in the footer) ---
  contactAddress: { type: String, default: 'Rawalpindi, Punjab, Pakistan' },
  contactPhone:   { type: String, default: '+92 300 1234567' },
  contactEmail:   { type: String, default: 'info@altaqiyya.pk' },
  contactHours:   { type: String, default: 'Mon–Sat: 9am – 6pm' },
  whatsappNumber: { type: String, default: '923001234567' }, // digits only, for wa.me
}, { timestamps: true });

// Always work with the one global document; create it on first access.
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
