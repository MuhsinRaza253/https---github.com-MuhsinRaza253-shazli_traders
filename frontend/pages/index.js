import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products/featured`).then(r => setFeatured(r.data)).catch(() => {});
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Al-Taqiyya | Premium Islamic Caps & Prayer Hats</title>
        <meta name="description" content="Discover authentic Islamic caps — Kufi, Sindhi Topi, Prayer Caps and more. Premium quality, shipped across Pakistan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, var(--emerald) 0%, #0f3d25 60%, #0a2518 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M40 0l10 20h20L55 33l7.7 23.7L40 44 17.3 56.7 25 33 10 20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}/>

        {/* Gold accent circle */}
        <div style={{
          position: 'absolute', right: '-10%', top: '50%', transform: 'translateY(-50%)',
          width: '55vw', height: '55vw', maxWidth: 700,
          borderRadius: '50%', border: '2px solid rgba(200,151,42,0.2)',
          boxShadow: '0 0 0 60px rgba(200,151,42,0.03)',
        }}/>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.1em' }}>
              بسم الله الرحمن الرحيم
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700 }}>
              Premium Islamic Headwear
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.05, marginBottom: 24 }}>
              Crafted with <span style={{ color: 'var(--gold-lt)' }}>Faith &</span><br/>Tradition
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 460 }}>
              Discover our curated collection of authentic Islamic caps — from classic Kufi to intricate embroidered Topi. Quality that honours your prayer.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn btn-gold btn-lg">Shop Now</Link>
              <Link href="/shop?featured=true" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                View Featured
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
              {[['500+', 'Happy Customers'], ['50+', 'Cap Styles'], ['4.9★', 'Average Rating']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-lt)' }}>{val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--white)' }}>Why Choose Al-Taqiyya?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: '🌟', title: 'Premium Quality', desc: 'Hand-selected materials sourced from trusted weavers' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping across Pakistan on orders over PKR 3,000' },
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
