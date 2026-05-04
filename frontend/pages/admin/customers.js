import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const { data } = await axios.get(`${API}/admin/customers?${params}`);
      setCustomers(data.customers);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search]);

  const toggleActive = async (id, current, name) => {
    try {
      await axios.put(`${API}/admin/customers/${id}/toggle`);
      toast.success(`${name} ${current ? 'deactivated' : 'activated'}`);
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
    } catch { toast.error('Action failed'); }
  };

  return (
    <>
      <Head><title>Customers | Admin</title></Head>
      <AdminLayout title="Customers">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 300 }} />
          <span style={{ color: 'var(--ink-lt)', fontSize: '0.875rem' }}>{total} customers</span>
        </div>

        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? <div className="spinner" style={{ margin: 40 }} /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--cream)', borderBottom: '2px solid var(--cream-dk)' }}>
                    {['Customer', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-lt)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-lt)' }}>No customers found.</td></tr>
                  ) : customers.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--cream-dk)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--emerald)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--ink-mid)' }}>{c.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--ink-lt)' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--ink-lt)', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Blocked'}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => toggleActive(c._id, c.isActive, c.name)} style={{
                          padding: '6px 14px', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.8rem',
                          background: c.isActive ? 'var(--red)' : 'var(--emerald)', color: 'var(--white)',
                        }}>{c.isActive ? 'Block' : 'Activate'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: p === page ? 'var(--emerald)' : 'var(--white)', color: p === page ? 'var(--white)' : 'var(--ink)', border: '1px solid var(--cream-dk)', cursor: 'pointer', fontWeight: 600 }}>{p}</button>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
