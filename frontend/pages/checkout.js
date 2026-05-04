import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', province: '', postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');

  const setAddr = (f) => (e) => setAddress(a => ({ ...a, [f]: e.target.value }));

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.province) {
      toast.error('Please fill all required address fields');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i._id, name: i.name,
        image: i.images?.[0] || '',
        price: i.salePrice || i.price,
        size: i.size, color: i.color,
        quantity: i.quantity,
      }));

      const { data } = await axios.post(`${API}/orders`, {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        notes,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing order');
    }
    setLoading(false);
  };

  if (!user) return (
    <><Navbar />
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 16 }}>Please login to checkout</h2>
      <Link href="/auth/login?redirect=/checkout" className="btn btn-primary btn-lg">Login</Link>
    </div><Footer /></>
  );

  if (items.length === 0) return (
    <><Navbar />
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 16 }}>Your cart is empty</h2>
      <Link href="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
    </div><Footer /></>
  );

  return (
    <>
      <Head><title>Checkout | Al-Taqiyya</title></Head>
      <Navbar />

      <div style={{ background: 'var(--emerald)', padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--white)', fontSize: '2.5rem' }}>Checkout</h1>
        {/* Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, alignItems: 'center' }}>
          {[['1', 'Shipping'], ['2', 'Payment'], ['3', 'Confirm']].map(([n, label], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', background: step >= Number(n) ? 'var(--gold)' : 'rgba(255,255,255,0.2)', color: 'var(--white)' }}>{n}</div>
              <span style={{ color: step >= Number(n) ? 'var(--gold-lt)' : 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
              {i < 2 && <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }} className="checkout-grid">

          {/* Left: Steps */}
          <div>
            {/* STEP 1: Address */}
            {step === 1 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', marginBottom: 24 }}>Shipping Address</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={address.name} onChange={setAddr('name')} placeholder="Ahmad Ali" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" value={address.phone} onChange={setAddr('phone')} placeholder="+92 300 1234567" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" value={address.street} onChange={setAddr('street')} placeholder="House #, Street, Area" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={address.city} onChange={setAddr('city')} placeholder="Rawalpindi" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province *</label>
                    <select className="form-input" value={address.province} onChange={setAddr('province')}>
                      <option value="">Select Province</option>
                      {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan', 'ICT'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Order Notes (optional)</label>
                  <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." />
                </div>
                <button onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>Continue to Payment →</button>
              </div>
            )}

            {/* STEP 2: Payment */}
            {step === 2 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', marginBottom: 24 }}>Payment Method</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                    { value: 'jazzcash', label: 'JazzCash', icon: '📱', desc: 'Pay via JazzCash mobile wallet' },
                    { value: 'easypaisa', label: 'Easypaisa', icon: '💳', desc: 'Pay via Easypaisa mobile wallet' },
                    { value: 'stripe', label: 'Card (Stripe)', icon: '🔒', desc: 'Visa, Mastercard — secure payment' },
                  ].map(({ value, label, icon, desc }) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 'var(--radius)', border: `2px solid ${paymentMethod === value ? 'var(--emerald)' : 'var(--cream-dk)'}`, cursor: 'pointer', background: paymentMethod === value ? 'rgba(26,92,58,0.05)' : 'transparent', transition: 'var(--transition)' }}>
                      <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} style={{ accentColor: 'var(--emerald)', width: 18, height: 18 }} />
                      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
                  <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm */}
            {step === 3 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', marginBottom: 24 }}>Confirm Your Order</h2>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: 8 }}>📍 Delivering to</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', lineHeight: 1.8 }}>{address.name} — {address.phone}<br />{address.street}, {address.city}, {address.province}</p>
                </div>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: 8 }}>💳 Payment: {paymentMethod.toUpperCase()}</h4>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 2 }}>
                    {loading ? '⏳ Placing Order...' : '✓ Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', height: 'fit-content', position: 'sticky', top: 100 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 16 }}>Order Summary</h3>
            {items.map(item => (
              <div key={item.cartKey} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--cream-dk)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
                  {item.images?.[0] ? <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎩</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.name}</div>
                  {item.size && <div style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>Size: {item.size}</div>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 700 }}>×{item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>PKR {((item.salePrice || item.price) * item.quantity).toLocaleString()}</div>
              </div>
            ))}
            {[['Subtotal', `PKR ${subtotal.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE 🎉' : `PKR ${shipping}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--ink-lt)' }}>{l}</span>
                <span style={{ fontWeight: 600, color: v === 'FREE 🎉' ? 'var(--emerald)' : undefined }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--cream-dk)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--emerald)' }}>PKR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx global>{`@media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
