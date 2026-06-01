import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import HeaderShowcase from '../components/HeaderShowcase';
import { useCart } from '../context/CartContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const { freeShippingThreshold } = useCart();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products/featured`).then(r => setFeatured(r.data)).catch(() => {});
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Shazli Traders | Premium Islamic Caps & Prayer Hats</title>
        <meta name="description" content="Discover authentic Islamic caps — Kufi, Sindhi Topi, Prayer Caps and more. Premium quality, shipped across Pakistan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />

      {/* HERO — branded banner */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="hero-bismillah">بسم الله الرحمن الرحيم</div>
          <div className="hero-cta">
            <Link href="/shop" className="btn btn-gold btn-lg">Shop Now</Link>
            <Link href="/shop?featured=true" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff', border: '1.5px solid var(--gold-lt)', backdropFilter: 'blur(8px)', fontWeight: 700 }}>View Featured</Link>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: 'var(--emerald)', padding: '26px 24px' }}>
        <div className="container" style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: 24, flexWrap: 'wrap', textAlign: 'center' }}>
          {[['500+', 'Happy Customers'], ['50+', 'Cap Styles'], ['4.9★', 'Average Rating'], ['Gujranwala', 'Best Wholesale Rates']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--gold-lt)' }}>{val}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP PICKS — products with onHeader enabled */}
      <HeaderShowcase />

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          height: clamp(360px, 52vw, 640px);
          overflow: hidden;
          background: #0a1733;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: url('/hero-banner.jpg') center center / cover no-repeat;
          transform: scale(1.02);
          animation: heroZoom 20s ease-in-out infinite alternate;
        }
        .hero-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(8,18,40,0.92) 0%, rgba(8,18,40,0.35) 30%, rgba(8,18,40,0) 55%),
            radial-gradient(120% 80% at 50% 120%, rgba(200,151,42,0.18) 0%, rgba(200,151,42,0) 60%);
        }
        .hero-content {
          position: absolute;
          left: 0; right: 0; bottom: clamp(20px, 4vw, 52px);
          z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          padding: 0 16px;
          animation: heroRise 0.9s ease-out both;
        }
        .hero-bismillah {
          font-family: 'Amiri', serif;
          color: var(--gold-lt);
          font-size: clamp(1.1rem, 2.6vw, 1.9rem);
          letter-spacing: 0.04em;
          text-shadow: 0 2px 16px rgba(0,0,0,0.65);
        }
        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
        .hero-ghost {
          background: rgba(255,255,255,0.12);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
        }
        .hero-ghost:hover { background: rgba(255,255,255,0.22); }
        @keyframes heroZoom { from { transform: scale(1.02); } to { transform: scale(1.1); } }
        @keyframes heroRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .hero-bg { animation: none; }
          .hero-content { animation: none; }
        }
      `}</style>

      {/* CATEGORIES */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 8 }}>Our Collection</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--ink)' }}>Shop by Category</h2>
          </div>

          {categories.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
              {categories.map(cat => (
                <Link key={cat._id} href={`/shop?category=${cat._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                    padding: '28px 20px', textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)',
                    border: '2px solid transparent',
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 12 }} />
                    ) : (
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕌</div>
                    )}
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--ink)' }}>{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
              {['Kufi Caps', 'Sindhi Topi', 'Prayer Caps', 'Kufiyah', 'Embroidered', 'Kids Caps'].map(name => (
                <Link key={name} href={`/shop?search=${name}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>☪️</div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'var(--ink)' }}>{name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 8 }}>Handpicked</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--ink)' }}>Featured Caps</h2>
            </div>
            <Link href="/shop?featured=true" className="btn btn-outline">View All →</Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid-products">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--ink-lt)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🕌</div>
              <p>Products loading or not added yet.</p>
              <Link href="/shop" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Shop</Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="section pattern-bg">
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--white)' }}>Why Choose Shazli Traders?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: '🌟', title: 'Premium Quality', desc: 'Hand-selected materials sourced from trusted weavers' },
              { icon: '🚚', title: 'Fast Delivery', desc: freeShippingThreshold > 0 ? `Free shipping across Pakistan on orders over PKR ${freeShippingThreshold.toLocaleString()}` : 'Reliable delivery across Pakistan' },
              { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
              { icon: '💬', title: '24/7 Support', desc: 'WhatsApp support for all your questions' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center', color: 'var(--white)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--cream-dk)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: 'var(--gold)', marginBottom: 8 }}>الصلاة خير من النوم</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--ink)', marginBottom: 16 }}>Ready to Elevate Your Prayer?</h2>
        <p style={{ color: 'var(--ink-lt)', marginBottom: 32, fontSize: '1.05rem' }}>Join hundreds of satisfied customers across Pakistan.</p>
        <Link href="/shop" className="btn btn-primary btn-lg">Shop the Collection</Link>
      </section>

      <Footer />
    </>
  );
}
