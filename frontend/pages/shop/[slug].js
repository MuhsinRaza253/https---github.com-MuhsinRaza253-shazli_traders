import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetail({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selected, setSelected] = useState({});     // { [featureName]: value }
  const [quantity, setQuantity] = useState(1);
  const [perUnit, setPerUnit] = useState(false);     // pick options for each cap
  const [variants, setVariants] = useState([]);      // [{ [featureName]: value }] per cap
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // All required option groups for this product: built-in Size/Color + custom features
  const featureGroups = product ? [
    ...(product.sizes?.length ? [{ name: 'Size', options: product.sizes }] : []),
    ...(product.colors?.length ? [{ name: 'Color', options: product.colors }] : []),
    ...((product.features || []).filter(f => f.name && f.options?.length).map(f => ({ name: f.name, options: f.options }))),
  ] : [];
  const hasOptions = featureGroups.length > 0;
  const splitMode = perUnit && quantity > 1 && hasOptions;

  // Keep the per-cap variant list sized to the quantity (new rows inherit current selections)
  useEffect(() => {
    setVariants(prev => {
      const next = prev.slice(0, quantity);
      while (next.length < quantity) next.push({ ...selected });
      return next;
    });
  }, [quantity, selected]);

  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}>Product not found.</div>;

  const pick = (name, value) => setSelected(s => ({ ...s, [name]: value }));
  const updateVariant = (idx, name, value) =>
    setVariants(prev => prev.map((v, i) => (i === idx ? { ...v, [name]: value } : v)));
  const toAttributes = sel => featureGroups.map(g => ({ name: g.name, value: sel[g.name] || '' }));
  const missingIn = sel => featureGroups.filter(g => !sel[g.name]).map(g => g.name);

  const handleAddToCart = () => {
    if (splitMode) {
      for (const v of variants) {
        const miss = missingIn(v);
        if (miss.length) { toast.error(`Please choose ${miss.join(' & ')} for each cap`); return; }
      }
      // Merge identical option combos into single cart lines
      const groups = {};
      variants.forEach(v => {
        const attrs = toAttributes(v);
        const key = attrs.map(a => `${a.name}=${a.value}`).join('&');
        if (!groups[key]) groups[key] = { attrs, qty: 0 };
        groups[key].qty++;
      });
      Object.values(groups).forEach(g => addItem(product, g.qty, g.attrs));
      const lines = Object.keys(groups).length;
      toast.success(`${quantity} caps added (${lines} variant${lines > 1 ? 's' : ''})!`);
      return;
    }

    const miss = missingIn(selected);
    if (miss.length) { toast.error(`Please select ${miss.join(' & ')}`); return; }
    addItem(product, quantity, toAttributes(selected));
    toast.success('Added to cart!');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    }
    setSubmitting(false);
  };

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <>
      <Head>
        <title>{`${product.name} | Shazli Traders`}</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
      </Head>
      <Navbar />

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ marginBottom: 24, fontSize: '0.85rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="product-grid">

          {/* Images */}
          <div>
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '1', marginBottom: 12 }}>
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>🕌</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} style={{
                    width: 72, height: 72, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: i === selectedImage ? '2px solid var(--emerald)' : '2px solid transparent',
                    background: 'none',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category?.name}</span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', margin: '8px 0' }}>{product.name}</h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--ink-lt)' }}>{product.rating} ({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--emerald)' }}>PKR {price.toLocaleString()}</span>
              {product.salePrice && (
                <>
                  <span style={{ fontSize: '1.2rem', color: 'var(--ink-lt)', textDecoration: 'line-through' }}>PKR {product.price.toLocaleString()}</span>
                  <span className="badge badge-danger">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ color: 'var(--ink-mid)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.95rem' }}>{product.description}</p>

            {/* Stock */}
            <div style={{ marginBottom: 16 }}>
              {product.stock > 0 ? (
                <span style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '0.875rem' }}>✓ In Stock ({product.stock} available)</span>
              ) : (
                <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: '0.875rem' }}>✗ Out of Stock</span>
              )}
            </div>

            {/* Option groups (Size, Color, custom features) — all required */}
            {!splitMode && featureGroups.map(g => (
              <div key={g.name} style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: 8 }}>
                  {g.name}: <span style={{ color: 'var(--emerald)' }}>{selected[g.name] || ''}</span>
                  <span style={{ color: 'var(--red)' }}> *</span>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {g.options.map(opt => {
                    const on = selected[g.name] === opt;
                    return (
                      <button key={opt} onClick={() => pick(g.name, opt)} style={{
                        padding: '8px 16px', border: on ? '2px solid var(--emerald)' : '2px solid var(--cream-dk)',
                        borderRadius: 'var(--radius)', background: on ? 'var(--emerald)' : 'transparent',
                        color: on ? 'var(--white)' : 'var(--ink)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      }}>{opt}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 700, fontSize: '0.875rem', display: 'block', marginBottom: 8 }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '2px solid var(--cream-dk)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}>−</button>
                <span style={{ padding: '10px 16px', fontWeight: 700, minWidth: 50, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}>+</button>
              </div>
            </div>

            {/* Per-cap size/color — only when ordering more than one of a product with options */}
            {hasOptions && quantity > 1 && (
              <div style={{ marginBottom: 24, background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10 }}>
                  You're ordering {quantity} caps — should they all be the same?
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: splitMode ? 16 : 0 }}>
                  {[
                    { val: false, label: 'Same for all' },
                    { val: true, label: 'Choose for each cap' },
                  ].map(({ val, label }) => (
                    <button key={label} onClick={() => setPerUnit(val)} style={{
                      padding: '8px 16px', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      border: perUnit === val ? '2px solid var(--emerald)' : '2px solid var(--cream-dk)',
                      background: perUnit === val ? 'var(--emerald)' : 'var(--white)',
                      color: perUnit === val ? 'var(--white)' : 'var(--ink)',
                    }}>{label}</button>
                  ))}
                </div>

                {splitMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {variants.map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', minWidth: 54, color: 'var(--ink-mid)' }}>Cap {idx + 1}</span>
                        {featureGroups.map(g => (
                          <select key={g.name} className="form-input" value={v[g.name] || ''} onChange={e => updateVariant(idx, g.name, e.target.value)} style={{ flex: 1, minWidth: 110, padding: '8px 10px' }}>
                            <option value="">{g.name}</option>
                            {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                🛒 Add to Cart
              </button>
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
                style={{ padding: '16px 20px', background: '#25d366', color: 'var(--white)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', fontWeight: 700, textDecoration: 'none' }}>
                💬
              </a>
            </div>

            {/* Details */}
            {(product.material || product.sku) && (
              <div style={{ marginTop: 24, padding: 16, background: 'var(--cream)', borderRadius: 'var(--radius)' }}>
                {product.material && <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)', marginBottom: 4 }}><strong>Material:</strong> {product.material}</p>}
                {product.sku && <p style={{ fontSize: '0.875rem', color: 'var(--ink-mid)' }}><strong>SKU:</strong> {product.sku}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 32 }}>Customer Reviews</h2>

          {product.reviews?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {product.reviews.map((r, i) => (
                <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong>{r.name}</strong>
                      <div className="stars" style={{ fontSize: '0.9rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-lt)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--ink-mid)', fontSize: '0.9rem' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-lt)', marginBottom: 40 }}>No reviews yet. Be the first to review!</p>
          )}

          {/* Add review form */}
          {user && (
            <form onSubmit={handleReview} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 500 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 20 }}>Write a Review</h3>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: n <= reviewRating ? 'var(--gold)' : '#ccc' }}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea className="form-input" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." required />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          )}
        </div>
      </div>

      <Footer />
      <style jsx global>{`
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr !important; } }
        .breadcrumb a { color: var(--ink-lt); text-decoration: none; font-weight: 600; transition: color 0.2s; }
        .breadcrumb a:hover { color: var(--emerald); }
        .breadcrumb .sep { color: var(--cream-dk); margin: 0 10px; }
        .breadcrumb .current { color: var(--ink); font-weight: 700; }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.slug}`);
    return { props: { product: data } };
  } catch {
    return { props: { product: null } };
  }
}
