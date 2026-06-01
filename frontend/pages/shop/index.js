import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ShopPage() {
  const router = useRouter();
  const { category, search, featured, sort: initSort } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({ sort: 'newest', minPrice: '', maxPrice: '' });
  const [searchInput, setSearchInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSearchInput(search || '');
    setFilters(f => ({ ...f, sort: initSort || 'newest' }));
    loadProducts();
  }, [router.query, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (featured) params.set('featured', featured);
      params.set('sort', filters.sort || initSort || 'newest');
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await axios.get(`${API}/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { }
    setLoading(false);
  };

  const applyFilters = () => {
    setPage(1);
    loadProducts();
    setSidebarOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop${searchInput ? `?search=${searchInput}` : ''}`);
  };

  return (
    <>
      <Head>
        <title>Shop Islamic Caps | Shazli Traders</title>
      </Head>
      <Navbar />

      {/* Page Header */}
      <div style={{ background: 'var(--emerald)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri, serif', color: 'var(--gold)', fontSize: '1.4rem', marginBottom: 4 }}>المتجر</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--white)', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          {search ? `Search: "${search}"` : category ? 'Category Collection' : 'Our Full Collection'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: '0.9rem' }}>{total} products found</p>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 32, maxWidth: 500 }}>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            className="form-input" placeholder="Search for caps..."
            style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Sidebar Filters */}
          <aside style={{
            width: 240, flexShrink: 0,
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            padding: 24, boxShadow: 'var(--shadow-sm)',
          }} className="filter-sidebar">
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 20 }}>Filter & Sort</h3>

            {/* Sort */}
            <div className="form-group">
              <label className="form-label">Sort By</label>
              <select className="form-input" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>

            {/* Price range */}
            <div className="form-group">
              <label className="form-label">Price Range (PKR)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" placeholder="Min" value={filters.minPrice}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} style={{ flex: 1 }} />
                <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} style={{ flex: 1 }} />
              </div>
            </div>

            {/* Categories */}
            <div className="form-group">
              <label className="form-label">Categories</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/shop" style={{ color: !category ? 'var(--emerald)' : 'var(--ink-mid)', fontWeight: !category ? 700 : 400, fontSize: '0.875rem', textDecoration: 'none', cursor: 'pointer' }}>All Products ({total})</a>
                {categories.map(cat => (
                  <a key={cat._id} href={`/shop?category=${cat._id}`}
                    style={{ color: category === cat._id ? 'var(--emerald)' : 'var(--ink-mid)', fontWeight: category === cat._id ? 700 : 400, fontSize: '0.875rem', textDecoration: 'none', cursor: 'pointer' }}>
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>

            <button onClick={applyFilters} className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
            <button onClick={() => { setFilters({ sort: 'newest', minPrice: '', maxPrice: '' }); router.push('/shop'); }}
              className="btn btn-outline" style={{ width: '100%', marginTop: 8 }}>Clear Filters</button>
          </aside>

          {/* Products Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-lt)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 8 }}>No products found</h3>
                <p>Try a different search or browse all products.</p>
              </div>
            ) : (
              <>
                <div className="grid-products">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 40, height: 40, borderRadius: 'var(--radius)',
                        background: p === page ? 'var(--emerald)' : 'var(--white)',
                        color: p === page ? 'var(--white)' : 'var(--ink)',
                        border: p === page ? 'none' : '1px solid var(--cream-dk)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <style jsx global>{`@media (max-width: 768px) { .filter-sidebar { display: none; } }`}</style>
    </>
  );
}
