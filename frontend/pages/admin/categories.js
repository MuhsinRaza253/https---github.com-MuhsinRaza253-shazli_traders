import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [imageFile, setImageFile] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await axios.put(`${API}/categories/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated!');
      } else {
        await axios.post(`${API}/categories`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created!');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', description: '', sortOrder: 0 }); setImageFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <Head><title>Categories | Admin</title></Head>
      <AdminLayout title="Categories">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ color: 'var(--ink-lt)', fontSize: '0.875rem' }}>{categories.length} categories</span>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', description: '', sortOrder: 0 }); }} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 16 }}>{editing ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kufi Caps" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sort Order</label>
                  <input type="number" className="form-input" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ padding: '10px 0' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Grid */}
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {categories.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--ink-lt)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>📂</div>
                <p>No categories yet. Add your first one!</p>
              </div>
            ) : categories.map(cat => (
              <div key={cat._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 100, background: 'var(--cream)', overflow: 'hidden' }}>
                  {cat.image ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📂</div>}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>{cat.name}</h3>
                      {cat.description && <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)', marginTop: 4 }}>{cat.description}</p>}
                    </div>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>{cat.isActive ? 'Active' : 'Off'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => openEdit(cat)} style={{ flex: 1, padding: '8px', background: 'var(--emerald)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Edit</button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} style={{ flex: 1, padding: '8px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
