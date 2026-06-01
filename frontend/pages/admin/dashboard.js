import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS = {
  pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#10b981', cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="spinner" /></AdminLayout>;

  const { stats, recentOrders = [], topProducts = [], ordersByStatus = [], monthlyRevenue = [] } = data || {};

  return (
    <>
      <Head><title>Admin Dashboard | Shazli Traders</title></Head>
      <AdminLayout title="Dashboard">

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Revenue', value: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#10b981', bg: '#d1fae5' },
            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Customers', value: stats?.totalCustomers || 0, icon: '👥', color: '#8b5cf6', bg: '#ede9fe' },
            { label: 'Products', value: stats?.totalProducts || 0, icon: '🎩', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: '#ef4444', bg: '#fee2e2' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{icon}</div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-lt)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue Simple Chart */}
        {monthlyRevenue.length > 0 && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 20 }}>Revenue (Last 6 Months)</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
              {monthlyRevenue.map((m, i) => {
                const max = Math.max(...monthlyRevenue.map(r => r.revenue));
                const height = max > 0 ? (m.revenue / max) * 140 : 10;
                const months = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ink-lt)', fontWeight: 600 }}>
                      {m.revenue > 0 ? `${(m.revenue/1000).toFixed(0)}K` : ''}
                    </div>
                    <div style={{ width: '100%', height, background: 'var(--emerald)', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.3s' }} title={`PKR ${m.revenue.toLocaleString()}`} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>{months[m._id.month]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }} className="admin-grid">

          {/* Recent Orders */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem' }}>Recent Orders</h2>
              <Link href="/admin/orders" style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--ink-lt)', textAlign: 'center', padding: '24px 0' }}>No orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentOrders.map(order => (
                  <Link key={order._id} href={`/admin/orders?id=${order._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--cream-dk)', textDecoration: 'none', color: 'var(--ink)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>#{order._id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>{order.user?.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.875rem' }}>PKR {order.totalPrice?.toLocaleString()}</div>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 100,
                        background: STATUS_COLORS[order.status] + '20',
                        color: STATUS_COLORS[order.status],
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
                      }}>{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem' }}>Top Products</h2>
              <Link href="/admin/products" style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Manage →</Link>
            </div>
            {topProducts.length === 0 ? (
              <p style={{ color: 'var(--ink-lt)', textAlign: 'center', padding: '24px 0' }}>No products yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topProducts.map((p, i) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--cream-dk)' }}>
                    <div style={{ width: 24, height: 24, background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎩</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>{p.soldCount} sold</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.875rem' }}>PKR {p.price?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        {ordersByStatus.length > 0 && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', marginBottom: 16 }}>Orders by Status</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {ordersByStatus.map(({ _id: status, count }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: (STATUS_COLORS[status] || '#aaa') + '20' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] || '#aaa' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: STATUS_COLORS[status] || '#aaa', textTransform: 'capitalize' }}>{status}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </AdminLayout>
      <style jsx global>{`@media (max-width: 900px) { .admin-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
