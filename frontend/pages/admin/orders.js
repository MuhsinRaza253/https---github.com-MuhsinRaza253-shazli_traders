import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS = {
  pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#10b981', cancelled: '#ef4444',
};
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const { data } = await axios.get(`${API}/admin/orders${params}`);
      setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openOrder = (order) => {
    setSelected(order);
    setNewStatus(order.status);
    setTrackingNum(order.trackingNumber || '');
  };

  const handleUpdate = async (extra = {}) => {
    setUpdating(true);
    try {
      const { data } = await axios.put(`${API}/admin/orders/${selected._id}`, { status: newStatus, trackingNumber: trackingNum, ...extra });
      toast.success('Order updated!');
      setOrders(prev => prev.map(o => o._id === data._id ? data : o));
      setSelected(data);
    } catch {}
    setUpdating(false);
  };

  const togglePaid = () => handleUpdate({ isPaid: !selected.isPaid });

  return (
    <>
      <Head><title>Orders | Admin</title></Head>
      <AdminLayout title="Orders">
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }} className="orders-grid">

          {/* Orders Table */}
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <button onClick={() => setFilterStatus('')} style={{ padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: !filterStatus ? 'var(--emerald)' : 'var(--white)', color: !filterStatus ? 'var(--white)' : 'var(--ink)', boxShadow: 'var(--shadow-sm)' }}>All Orders</button>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: filterStatus === s ? STATUS_COLORS[s] : 'var(--white)',
                  color: filterStatus === s ? 'var(--white)' : 'var(--ink)',
                  boxShadow: 'var(--shadow-sm)', textTransform: 'capitalize',
                }}>{s}</button>
              ))}
            </div>

            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {loading ? <div className="spinner" style={{ margin: 40 }} /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--cream)', borderBottom: '2px solid var(--cream-dk)' }}>
                        {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                          <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-lt)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-lt)' }}>No orders found.</td></tr>
                      ) : orders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid var(--cream-dk)', cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--cream)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => openOrder(o)}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>#{o._id.slice(-6).toUpperCase()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>{o.user?.email}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.875rem' }}>{o.orderItems?.length} item(s)</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.875rem', color: 'var(--emerald)' }}>PKR {o.totalPrice?.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${o.isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>{o.isPaid ? 'Paid' : 'Unpaid'}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, background: STATUS_COLORS[o.status] + '25', color: STATUS_COLORS[o.status], fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--ink-lt)', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button style={{ padding: '5px 10px', background: 'var(--emerald)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Order Detail Panel */}
          {selected && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', height: 'fit-content', position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem' }}>Order #{selected._id.slice(-6).toUpperCase()}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--ink-lt)' }}>✕</button>
              </div>

              {/* Customer */}
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selected.user?.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>{selected.user?.email}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>{selected.user?.phone}</p>
              </div>

              {/* Shipping */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>📍 Shipping Address</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-mid)', lineHeight: 1.6 }}>
                  {selected.shippingAddress?.name}<br />
                  {selected.shippingAddress?.street}<br />
                  {selected.shippingAddress?.city}, {selected.shippingAddress?.province}<br />
                  {selected.shippingAddress?.phone}
                </p>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>Items</p>
                {selected.orderItems?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span>{item.name}{(() => { const a = (item.attributes?.length ? item.attributes.filter(x => x.value).map(x => x.value) : [item.size, item.color].filter(Boolean)); return a.length ? ` (${a.join(', ')})` : ''; })()} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--cream-dk)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--emerald)' }}>PKR {selected.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment */}
              <div style={{ borderTop: '1px solid var(--cream-dk)', paddingTop: 16, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>Payment</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--ink-lt)' }}>Method</span>
                  <span style={{ fontWeight: 700 }}>{selected.paymentMethod === 'cod' ? 'Cash on Delivery' : selected.paymentMethod === 'online' ? 'Advance / Online' : selected.paymentMethod?.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 10 }}>
                  <span style={{ color: 'var(--ink-lt)' }}>Status</span>
                  <span style={{ fontWeight: 700, color: selected.isPaid ? 'var(--emerald)' : 'var(--gold)' }}>{selected.isPaid ? '✓ Paid' : '⏳ Unpaid'}</span>
                </div>

                {selected.paymentProof && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', marginBottom: 6 }}>Payment screenshot</p>
                    <a href={selected.paymentProof} target="_blank" rel="noopener noreferrer">
                      <img src={selected.paymentProof} alt="Payment proof" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--cream-dk)' }} />
                    </a>
                    <p style={{ fontSize: '0.7rem', color: 'var(--ink-lt)', marginTop: 4 }}>Click to open full size</p>
                  </div>
                )}

                <button onClick={togglePaid} disabled={updating} className="btn btn-outline" style={{ width: '100%' }}>
                  {selected.isPaid ? 'Mark as Unpaid' : '✓ Mark as Paid'}
                </button>
              </div>

              {/* Update Status */}
              <div style={{ borderTop: '1px solid var(--cream-dk)', paddingTop: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>Update Order</p>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tracking Number</label>
                  <input className="form-input" placeholder="e.g. TCS-12345" value={trackingNum} onChange={e => setTrackingNum(e.target.value)} />
                </div>
                <button onClick={() => handleUpdate()} disabled={updating} className="btn btn-primary" style={{ width: '100%' }}>
                  {updating ? 'Updating...' : '✓ Update Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
      <style jsx global>{`@media (max-width: 1100px) { .orders-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
