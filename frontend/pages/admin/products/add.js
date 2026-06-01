import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

const SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '56', '57', '58', '59', '60'];
const COLORS = ['White', 'Black', 'Green', 'Brown', 'Beige', 'Navy', 'Grey', 'Red', 'Gold'];

export default function AddProduct() {
  const router = useRouter();
  const editId = router.query.id;
  const isEdit = !!editId;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [origImages, setOrigImages] = useState([]); // existing Cloudinary URLs (edit mode)
  const [form, setForm] = useState({
    name: '', description: '', price: '', salePrice: '', category: '',
    stock: '', sku: '', material: '', featured: false, onHeader: false, isActive: true,
    sizes: [], colors: [], features: [], tags: '',
  });
  const [optInputs, setOptInputs] = useState({}); // per-feature "add option" text

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      axios.get(`${API}/products/${editId}`).then(({ data }) => {
        setForm({
          name: data.name, description: data.description, price: data.price,
          salePrice: data.salePrice || '', category: data.category?._id || '',
          stock: data.stock, sku: data.sku || '', material: data.material || '',
          featured: data.featured, onHeader: data.onHeader || false, isActive: data.isActive,
          sizes: data.sizes || [], colors: data.colors || [],
          features: (data.features || []).map(f => ({ name: f.name, options: [...(f.options || [])] })),
          tags: (data.tags || []).join(', '),
        });
        setPreviews(data.images || []);
        setOrigImages(data.images || []);
      }).catch(() => {});
    }
  }, [isEdit, editId]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(prev => {
      // Keep existing previews (URLs) for edits
      const newPreviews = files.map(f => URL.createObjectURL(f));
      return isEdit ? [...prev.filter(p => p.startsWith('http')), ...newPreviews] : newPreviews;
    });
  };

  const toggleItem = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
    }));
  };

  // Add a custom (admin-typed) size/color and select it
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');
  const addCustom = (field, value, reset) => {
    const v = value.trim();
    if (!v) return;
    setForm(f => f[field].includes(v) ? f : { ...f, [field]: [...f[field], v] });
    reset('');
  };

  // Custom feature builder
  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, { name: '', options: [] }] }));
  const removeFeature = (idx) => setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  const setFeatureName = (idx, name) => setForm(f => ({ ...f, features: f.features.map((ft, i) => i === idx ? { ...ft, name } : ft) }));
  const addFeatureOption = (idx) => {
    const v = (optInputs[idx] || '').trim();
    if (!v) return;
    setForm(f => ({ ...f, features: f.features.map((ft, i) => (i === idx && !ft.options.includes(v)) ? { ...ft, options: [...ft.options, v] } : ft) }));
    setOptInputs(p => ({ ...p, [idx]: '' }));
  };
  const removeFeatureOption = (idx, optIdx) =>
    setForm(f => ({ ...f, features: f.features.map((ft, i) => i === idx ? { ...ft, options: ft.options.filter((_, o) => o !== optIdx) } : ft) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Name, price and category are required'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'sizes' || k === 'colors') fd.append(k, JSON.stringify(v));
        else if (k === 'features') fd.append(k, JSON.stringify(v.filter(f => f.name?.trim() && f.options?.length)));
        else if (k === 'tags') fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      images.forEach(img => fd.append('images', img));

      // Tell the backend which existing images the admin removed in the UI
      if (isEdit) {
        const removeImages = origImages.filter(url => !previews.includes(url));
        if (removeImages.length) fd.append('removeImages', JSON.stringify(removeImages));
      }

      if (isEdit) {
        await axios.put(`${API}/products/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/products`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
    setLoading(false);
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <>
      <Head><title>{`${isEdit ? 'Edit' : 'Add'} Product | Admin`}</title></Head>
      <AdminLayout title={isEdit ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="product-form-grid">

            {/* Left col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Basic Information</h3>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" placeholder="e.g. Classic White Kufi Cap" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" placeholder="Describe the product in detail..." value={form.description} onChange={set('description')} rows={4} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input className="form-input" placeholder="e.g. Pure Cotton" value={form.material} onChange={set('material')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input className="form-input" placeholder="e.g. KFI-001" value={form.sku} onChange={set('sku')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="kufi, prayer, cotton, white" value={form.tags} onChange={set('tags')} />
                </div>
              </div>

              {/* Sizes */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Available Sizes</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[...new Set([...SIZES, ...form.sizes])].map(s => (
                    <button key={s} type="button" onClick={() => toggleItem('sizes', s)} style={{
                      padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      border: form.sizes.includes(s) ? '2px solid var(--emerald)' : '2px solid var(--cream-dk)',
                      background: form.sizes.includes(s) ? 'var(--emerald)' : 'transparent',
                      color: form.sizes.includes(s) ? 'var(--white)' : 'var(--ink)',
                    }}>{s}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" placeholder="Add another size…" value={customSize}
                    onChange={e => setCustomSize(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom('sizes', customSize, setCustomSize); } }}
                    style={{ flex: 1 }} />
                  <button type="button" onClick={() => addCustom('sizes', customSize, setCustomSize)} className="btn btn-outline">+ Add</button>
                </div>
              </div>

              {/* Colors */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Available Colors</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[...new Set([...COLORS, ...form.colors])].map(c => (
                    <button key={c} type="button" onClick={() => toggleItem('colors', c)} style={{
                      padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      border: form.colors.includes(c) ? '2px solid var(--emerald)' : '2px solid var(--cream-dk)',
                      background: form.colors.includes(c) ? 'rgba(26,92,58,0.1)' : 'transparent',
                      color: 'var(--ink)',
                    }}>{c}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="form-input" placeholder="Add another color…" value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom('colors', customColor, setCustomColor); } }}
                    style={{ flex: 1 }} />
                  <button type="button" onClick={() => addCustom('colors', customColor, setCustomColor)} className="btn btn-outline">+ Add</button>
                </div>
              </div>

              {/* Custom Features */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>Custom Features</h3>
                  <button type="button" onClick={addFeature} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>+ Add Feature</button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)', marginBottom: 16 }}>
                  Extra option groups beyond size/color (e.g. Fabric, Pattern). The customer must pick one option from every group.
                </p>

                {form.features.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-lt)' }}>No custom features. Most caps only need Size &amp; Color above.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {form.features.map((ft, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--cream-dk)', borderRadius: 'var(--radius)', padding: 14 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input className="form-input" placeholder="Feature name (e.g. Fabric)" value={ft.name}
                          onChange={e => setFeatureName(idx, e.target.value)} style={{ flex: 1 }} />
                        <button type="button" onClick={() => removeFeature(idx)} title="Remove feature"
                          style={{ padding: '0 14px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {ft.options.map((opt, oi) => (
                          <span key={oi} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius)', background: 'var(--cream)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {opt}
                            <button type="button" onClick={() => removeFeatureOption(idx, oi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, lineHeight: 1 }}>×</button>
                          </span>
                        ))}
                        {ft.options.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>No options yet</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input className="form-input" placeholder="Add an option…" value={optInputs[idx] || ''}
                          onChange={e => setOptInputs(p => ({ ...p, [idx]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeatureOption(idx); } }}
                          style={{ flex: 1 }} />
                        <button type="button" onClick={() => addFeatureOption(idx)} className="btn btn-outline">+ Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Product Images</h3>
                <label style={{
                  display: 'block', border: '2px dashed var(--cream-dk)', borderRadius: 'var(--radius)',
                  padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--emerald)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--cream-dk)'}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 4 }}>Click to upload images</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>JPG, PNG, WebP (max 5MB each, up to 5 images)</div>
                  <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
                </label>
                {previews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ width: 80, height: 80, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream)', position: 'relative' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setPreviews(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Pricing */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Pricing & Inventory</h3>
                <div className="form-group">
                  <label className="form-label">Price (PKR) *</label>
                  <input type="number" className="form-input" placeholder="0" min="0" value={form.price} onChange={set('price')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (PKR) — optional</label>
                  <input type="number" className="form-input" placeholder="Leave empty for no sale" min="0" value={form.salePrice} onChange={set('salePrice')} />
                  {form.salePrice && form.price && Number(form.salePrice) < Number(form.price) && (
                    <p style={{ color: 'var(--emerald)', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>
                      ✓ {Math.round((1 - form.salePrice/form.price)*100)}% discount applied
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" className="form-input" placeholder="0" min="0" value={form.stock} onChange={set('stock')} />
                </div>
              </div>

              {/* Category */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Category *</h3>
                <select className="form-input" value={form.category} onChange={set('category')} required>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <Link href="/admin/categories" style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600, textDecoration: 'none' }}>+ Add new category</Link>
              </div>

              {/* Settings */}
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', marginBottom: 16 }}>Settings</h3>
                {[
                  { field: 'featured', label: '⭐ Featured Product', desc: 'Show on homepage' },
                  { field: 'onHeader', label: '🖼️ Top Pick (Home Highlights)', desc: 'Show in the "Top Picks" strip on the homepage' },
                  { field: 'isActive', label: '✓ Active (Visible)', desc: 'Show in the shop' },
                ].map(({ field, label, desc }) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form[field]} onChange={set(field)}
                      style={{ width: 18, height: 18, accentColor: 'var(--emerald)', cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {loading ? '⏳ Saving...' : (isEdit ? '✓ Update Product' : '+ Create Product')}
              </button>
              <button type="button" onClick={() => router.push('/admin/products')} className="btn btn-outline" style={{ width: '100%' }}>Cancel</button>
            </div>
          </div>
        </form>
      </AdminLayout>
      <style jsx global>{`@media (max-width: 900px) { .product-form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
