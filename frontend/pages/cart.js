import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, shipping, total, freeShippingThreshold } = useCart();

  return (
    <>
      <Head><title>Cart | Shazli Traders</title></Head>
      <Navbar />
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', marginBottom: 32 }}>Shopping Cart</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '5rem', marginBottom: 16 }}>🛒</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--ink-lt)', marginBottom: 24 }}>Browse our collection and find your perfect cap.</p>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }} className="cart-grid">

            {/* Items */}
            <div>
              {items.map(item => (
                <div key={item.cartKey} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--cream-dk)' }}>
                  <div style={{ width: 100, height: 100, background: 'var(--cream)', borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🕌</div>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <Link href={`/shop/${item.slug}`} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>{item.name}</Link>
                    {(item.attributes?.length
                      ? item.attributes.filter(a => a.value)
                      : [item.size && { name: 'Size', value: item.size }, item.color && { name: 'Color', value: item.color }].filter(Boolean)
                    ).map(a => <p key={a.name} style={{ color: 'var(--ink-lt)', fontSize: '0.85rem' }}>{a.name}: {a.value}</p>)}
                    <div style={{ fontWeight: 700, color: 'var(--emerald)', marginTop: 4 }}>PKR {(item.salePrice || item.price).toLocaleString()}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--cream-dk)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.cartKey, item.quantity - 1)} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>−</button>
                      <span style={{ padding: '6px 12px', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.cartKey, item.quantity + 1)} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+</button>
                    </div>
                    <div style={{ fontWeight: 700 }}>PKR {((item.salePrice || item.price) * item.quantity).toLocaleString()}</div>
                    <button onClick={() => removeItem(item.cartKey)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', height: 'fit-content', position: 'sticky', top: 100 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 20 }}>Order Summary</h2>
              {[
                ['Subtotal', `PKR ${subtotal.toLocaleString()}`],
                ['Shipping', shipping === 0 ? 'FREE 🎉' : `PKR ${shipping.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--ink-lt)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: value === 'FREE 🎉' ? 'var(--emerald)' : 'var(--ink)' }}>{value}</span>
                </div>
              ))}
              {shipping > 0 && freeShippingThreshold > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--ink-lt)', marginBottom: 12 }}>Free shipping on orders over PKR {freeShippingThreshold.toLocaleString()}</p>}
              <div style={{ borderTop: '2px solid var(--cream-dk)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>
                <span>Total</span>
                <span style={{ color: 'var(--emerald)' }}>PKR {total.toLocaleString()}</span>
              </div>
              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>Proceed to Checkout</Link>
              <Link href="/shop" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style jsx global>{`@media (max-width: 768px) { .cart-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
