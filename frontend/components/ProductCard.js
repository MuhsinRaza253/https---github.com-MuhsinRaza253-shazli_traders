import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', transition: 'var(--transition)',
          boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          transform: hovered ? 'translateY(-4px)' : 'none',
          cursor: 'pointer',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--cream)' }}>
          {product.images?.[0] ? (
            <img
              src={hovered && product.images[1] ? product.images[1] : product.images[0]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🕌</div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {product.featured && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>⭐ Featured</span>}
            {discount > 0 && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>-{discount}%</span>}
            {product.stock === 0 && <span className="badge" style={{ background: 'var(--ink)', color: 'var(--white)', fontSize: '0.65rem' }}>Sold Out</span>}
          </div>

          {/* Quick add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              position: 'absolute', bottom: 12, left: 12, right: 12,
              padding: '10px', background: added ? 'var(--emerald)' : 'var(--ink)',
              color: 'var(--white)', border: 'none', borderRadius: 'var(--radius)',
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              opacity: hovered && product.stock > 0 ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.25s ease', fontFamily: 'inherit',
            }}
          >
            {added ? '✓ Added!' : product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {product.category?.name}
          </p>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3 }}>
            {product.name}
          </h3>

          {/* Stars */}
          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <div className="stars" style={{ fontSize: '0.75rem' }}>
                {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-lt)' }}>({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--emerald)' }}>
              PKR {(product.salePrice || product.price).toLocaleString()}
            </span>
            {product.salePrice && (
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-lt)', textDecoration: 'line-through' }}>
                PKR {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
