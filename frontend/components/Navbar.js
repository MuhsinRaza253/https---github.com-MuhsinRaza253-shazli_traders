import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); setDropdownOpen(false); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(250,247,240,0.97)' : 'var(--cream)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        backdropFilter: 'blur(12px)',
        transition: 'var(--transition)',
        borderBottom: scrolled ? '1px solid var(--cream-dk)' : 'none',
      }}>
        {/* Top bar */}
        <div style={{ background: 'var(--emerald)', color: 'var(--cream)', textAlign: 'center', padding: '8px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          Free shipping on orders over PKR 3,000 &nbsp;|&nbsp; <span style={{ fontFamily: 'Amiri, serif' }}>بسم الله الرحمن الرحيم</span>
        </div>

        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: 1200, margin: '0 auto' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>بيت الطاقية</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--emerald)', letterSpacing: '0.02em' }}>Al-Taqiyya</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="desktop-nav">
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop' },
              { href: '/shop?category=kufi', label: 'Kufi Caps' },
              { href: '/shop?category=prayer', label: 'Prayer Caps' },
              { href: '/shop?featured=true', label: 'Featured' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                color: router.asPath === href ? 'var(--emerald)' : 'var(--ink-mid)',
                transition: 'var(--transition)',
                paddingBottom: '2px',
                borderBottom: router.asPath === href ? '2px solid var(--gold)' : '2px solid transparent',
              }}>{label}</Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Cart */}
            <Link href="/cart" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--ink)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -8,
                  background: 'var(--gold)', color: 'var(--white)',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{totalItems}</span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--ink)', fontWeight: 600, fontSize: '0.9rem',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--emerald)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{user.name.split(' ')[0]}</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '120%',
                    background: 'var(--white)', borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--cream-dk)',
                    minWidth: 180, overflow: 'hidden', zIndex: 100,
                  }}>
                    {isAdmin && <DropdownLink href="/admin/dashboard" onClick={() => setDropdownOpen(false)} label="Admin Dashboard" icon="⚙️"/>}
                    <DropdownLink href="/orders" onClick={() => setDropdownOpen(false)} label="My Orders" icon="📦"/>
                    <DropdownLink href="/profile" onClick={() => setDropdownOpen(false)} label="Profile" icon="👤"/>
                    <div style={{ borderTop: '1px solid var(--cream-dk)' }}>
                      <button onClick={handleLogout} style={{
                        width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                        textAlign: 'left', cursor: 'pointer', color: 'var(--red)', fontWeight: 600, fontSize: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>🚪 Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/auth/login" className="btn btn-outline btn-sm">Login</Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-only" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ background: 'var(--white)', borderTop: '1px solid var(--cream-dk)', padding: '16px 24px' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/shop', label: 'Shop All' },
              { href: '/shop?category=kufi', label: 'Kufi Caps' },
              { href: '/shop?category=prayer', label: 'Prayer Caps' },
              { href: '/cart', label: `Cart (${totalItems})` },
              { href: '/orders', label: 'My Orders' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{
                display: 'block', padding: '12px 0', fontWeight: 600, color: 'var(--ink)',
                textDecoration: 'none', borderBottom: '1px solid var(--cream-dk)',
              }}>{label}</Link>
            ))}
          </div>
        )}
      </nav>
      <div style={{ height: 96 }} />
      <style jsx global>{`.desktop-nav { display: flex; } .mobile-only { display: none; } @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-only { display: flex !important; } }`}</style>
    </>
  );
}

function DropdownLink({ href, label, onClick, icon }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px', color: 'var(--ink)', textDecoration: 'none',
      fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)',
    }} onMouseOver={e => e.currentTarget.style.background = 'var(--cream)'}
       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
      {icon} {label}
    </Link>
  );
}
