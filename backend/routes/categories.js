const router = require('express').Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const toSlug = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories — admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const slug = toSlug(name);
    if (await Category.findOne({ slug }))
      return res.status(400).json({ message: 'Category already exists' });

    const cat = await Category.create({
      name, slug, description,
      image: req.file?.path || '',
      sortOrder: sortOrder || 0,
    });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/categories/:id — admin
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const { name, description, sortOrder, isActive } = req.body;
    if (name) { cat.name = name; cat.slug = toSlug(name); }
    if (description !== undefined) cat.description = description;
    if (sortOrder !== undefined) cat.sortOrder = sortOrder;
    if (isActive !== undefined) cat.isActive = isActive;
    if (req.file) cat.image = req.file.path;

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/categories/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
