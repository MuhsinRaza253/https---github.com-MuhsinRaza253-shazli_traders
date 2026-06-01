const router = require('express').Router();
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/settings — public. Customers need the delivery charge and the
// payment account details (to pay in advance) at checkout.
router.get('/', async (req, res) => {
  try {
    const s = await Settings.getSingleton();
    res.json({
      bankName: s.bankName,
      accountTitle: s.accountTitle,
      accountNumber: s.accountNumber,
      iban: s.iban,
      paymentInstructions: s.paymentInstructions,
      deliveryCharge: s.deliveryCharge,
      freeShippingThreshold: s.freeShippingThreshold,
      contactAddress: s.contactAddress,
      contactPhone: s.contactPhone,
      contactEmail: s.contactEmail,
      contactHours: s.contactHours,
      whatsappNumber: s.whatsappNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings — admin only
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const s = await Settings.getSingleton();
    const fields = [
      'bankName', 'accountTitle', 'accountNumber', 'iban', 'paymentInstructions',
      'deliveryCharge', 'freeShippingThreshold',
      'contactAddress', 'contactPhone', 'contactEmail', 'contactHours', 'whatsappNumber',
    ];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        s[f] = (f === 'deliveryCharge' || f === 'freeShippingThreshold')
          ? Number(req.body[f]) || 0
          : req.body[f];
      }
    });
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
