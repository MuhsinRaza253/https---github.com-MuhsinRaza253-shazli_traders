const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

let dbPromise = null;
function ensureDb() {
  if (!dbPromise) {
    dbPromise = mongoose.connect(process.env.MONGO_URI).catch(err => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'Islamic Caps API Running ✓' }));

if (require.main === module) {
  ensureDb()
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('DB Error:', err));
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
