import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL;
const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
const STATUS_ICONS = { pending: '⏳', processing: '⚙️', shipped: '🚚', delivered: '✅', cancelled: '❌' };

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/orders');
    if (user) {
      axios.get(`${API}/orders/my`)
        .then(r => setOrders(r.data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await axios.put(`${API}/orders/${id}/cancel`);
      toast.success('Order cancelled');
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling');
    }
  };

  if (loading || fetching) return <><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></>;

  return (
    <>
      <Head><title>My Orders | Shazli Traders</title></Head>
      <Navbar />

      <div style={{ background: 'var(--emerald)', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--white)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>My Orders</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{orders.length} total orders</p>
      </div>

      <div className="container" style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: 'var(--ink-lt)', marginBottom: 24 }}>Start shopping to see your orders here.</p>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Order Header */}
                <div style={{ background: 'var(--cream)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', fontWeight: 700, textTransform: 'uppercase' }}>Order ID</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>#{order._id.slice(-6).toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--emerald)' }}>PKR {order.totalPrice?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status], fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                    <button onClick={() => setSelected(selected?._id === order._id ? null : order)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--emerald)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {selected?._id === order._id ? 'Hide ▲' : 'Details ▼'}
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {order.orderItems?.slice(0, 4).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎩</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        {(() => { const a = (item.attributes?.length ? item.attributes.filter(x => x.value).map(x => x.value) : [item.size, item.color].filter(Boolean)); return a.length ? <div style={{ fontSize: '0.7rem', color: 'var(--ink-lt)' }}>{a.join(', ')}</div> : null; })()}
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>×{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--ink-lt)', fontSize: '0.875rem' }}>+{order.orderItems.length - 4} more</div>
                  )}
                </div>

                {/* Expanded Details */}
                {selected?._id === order._id && (
                  <div style={{ borderTop: '1px solid var(--cream-dk)', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div>
                        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', marginBottom: 8 }}>Shipping Address</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', lineHeight: 1.8 }}>
                          {order.shippingAddress?.name}<br />
                          {order.shippingAddress?.street}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.province}<br />
                          {order.shippingAddress?.phone}
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', marginBottom: 8 }}>Payment</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)' }}>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'online' ? 'Advance / Online' : order.paymentMethod?.toUpperCase()}</p>
                        <p style={{ fontSize: '0.875rem', color: order.isPaid ? 'var(--emerald)' : 'var(--gold)', fontWeight: 700 }}>
                          {order.isPaid ? '✓ Paid' : '⏳ Payment Pending'}
                        </p>
                        {order.paymentProof && (
                          <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)', marginBottom: 4 }}>Payment screenshot:</p>
                            <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                              <img src={order.paymentProof} alt="Payment proof" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--cream-dk)' }} />
                            </a>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <p style={{ fontSize: '0.875rem', marginTop: 8 }}>📦 Tracking: <strong>{order.trackingNumber}</strong></p>
                        )}
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order._id)} style={{ marginTop: 16, padding: '8px 20px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        ✕ Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
