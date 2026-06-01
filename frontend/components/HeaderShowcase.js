import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProductCard from './ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL;

// Clean "Top Picks" strip on the home page, driven by the product `onHeader` flag.
export default function HeaderShowcase() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(`${API}/products/header`).then(r => setItems(r.data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section" style={{ background: 'var(--white)', borderBottom: '1px solid var(--cream-dk)' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 8 }}>✦ Highlights</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--ink)' }}>This Week's Top Picks</h2>
          </div>
          <Link href="/shop" className="btn btn-outline">Browse All →</Link>
        </div>

        <div className="grid-products">
          {items.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
