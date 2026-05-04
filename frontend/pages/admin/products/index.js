import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await axios.get(`${API}/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await axios.put(`${API}/products/${id}`, { featured: !current });
      toast.success(`Product ${!current ? 'featured' : 'unfeatured'}`);
      load();
    } catch {}
  };

  return (
    <>
      <Head><title>Products | Admin</title></Head>
      <AdminLayout title="Products">

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
            <input className="form-input" placeholder="Search products..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ maxWidth: 280 }} />
            <span style={{ color: 'var(--ink-lt)', fontSize: '0.875rem' }}>{total} products</span>
          </div>
          <Link href="/admin/products/add" className="btn btn-primary">+ Add Product</Link>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {loading ? <div className="spinner" style={{ margin: 40 }} /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)', borderBottom: '2px solid var(--cream-dk)' }}>
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-lt)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-lt)' }}>No products found. <Link href="/admin/products/add">Add your first product →</Link></td></tr>
                  ) : products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--cream-dk)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream)' }}>
                          {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎩</div>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        {p.featured && <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700 }}>⭐ Featured</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--ink-lt)' }}>{p.category?.name || '—'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.875rem' }}>
                        PKR {(p.salePrice || p.price).toLocaleString()}
                        {p.salePrice && <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', textDecoration: 'line-through' }}>PKR {p.price.toLocaleString()}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: p.stock > 0 ? 'var(--emerald)' : 'var(--red)' }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>{p.isActive ? 'Active' : 'Hidden'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => toggleFeatured(p._id, p.featured)} title={p.featured ? 'Unfeature' : 'Feature'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                            {p.featured ? '★' : '☆'}
                          </button>
                          <Link href={`/admin/products/edit/${p._id}`} style={{ padding: '6px 12px', background: 'var(--emerald)', color: 'var(--white)', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Edit</Link>
                          <button onClick={() => handleDelete(p._id, p.name)} style={{ padding: '6px 12px', background: 'var(--red)', color: 'var(--white)', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: p === page ? 'var(--emerald)' : 'var(--white)', color: p === page ? 'var(--white)' : 'var(--ink)', border: '1px solid var(--cream-dk)', cursor: 'pointer', fontWeight: 600 }}>{p}</button>
            ))}
          </div>
        )}

      </AdminLayout>
    </>
  );
}
