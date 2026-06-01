import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/products', icon: '🎩', label: 'Products' },
  { href: '/admin/categories', icon: '📂', label: 'Categories' },
  { href: '/admin/orders', icon: '📦', label: 'Orders' },
  { href: '/admin/customers', icon: '👥', label: 'Customers' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children, title }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/auth/login');
  }, [user, loading, isAdmin]);

  if (loading || !user || !isAdmin) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--emerald)', display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily: 'Amiri, serif', color: 'var(--gold)', fontSize: '1.1rem', marginBottom: 2 }}>لوحة التحكم</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--white)' }}>Shazli Traders Admin</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map(({ href, icon, label }) => {
            const active = router.pathname === href || router.pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 24px', textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? 'var(--white)' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 700 : 400, fontSize: '0.9rem',
                borderRight: active ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'var(--transition)',
              }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>{icon}</span> {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Administrator</div>
            </div>
          </div>
          <Link href="/" style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 8, textDecoration: 'none' }}>🌐 View Store</Link>
          <button onClick={() => { logout(); router.push('/'); }} style={{
            width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius)',
            color: 'var(--white)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, padding: '32px', minHeight: '100vh' }}>
        {title && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--ink)', fontWeight: 600 }}>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
