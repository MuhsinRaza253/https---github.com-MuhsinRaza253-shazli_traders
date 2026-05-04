import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--cream-dk)', marginTop: 'auto' }}>
      {/* Main footer */}
      <div className="container" style={{ padding: '60px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 4 }}>بيت الطاقية</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Al-Taqiyya</div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#a09880' }}>
              Premium Islamic caps crafted with care and devotion. Serving the Muslim community with quality prayer caps since 2020.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              {['📱', '📘', '📸'].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}>{icon}</div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: 'var(--white)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', marginBottom: 16 }}>Shop</h4>
            {[
              { href: '/shop', label: 'All Products' },
              { href: '/shop?category=kufi', label: 'Kufi Caps' },
              { href: '/shop?category=prayer', label: 'Prayer Caps' },
              { href: '/shop?category=sindhi', label: 'Sindhi Topi' },
              { href: '/shop?featured=true', label: 'Featured Items' },
              { href: '/shop?sort=newest', label: 'New Arrivals' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', color: '#a09880', textDecoration: 'none', marginBottom: 8, fontSize: '0.875rem', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = 'var(--gold)'}
                onMouseOut={e => e.target.style.color = '#a09880'}
              >{label}</Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: 'var(--white)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', marginBottom: 16 }}>Account</h4>
            {[
              { href: '/auth/login', label: 'Login' },
              { href: '/auth/register', label: 'Register' },
              { href: '/orders', label: 'My Orders' },
              { href: '/profile', label: 'My Profile' },
              { href: '/cart', label: 'Cart' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', color: '#a09880', textDecoration: 'none', marginBottom: 8, fontSize: '0.875rem' }}>{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'var(--white)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', marginBottom: 16 }}>Contact</h4>
            {[
              { icon: '📍', text: 'Rawalpindi, Punjab, Pakistan' },
              { icon: '📞', text: '+92 300 1234567' },
              { icon: '✉️', text: 'info@altaqiyya.pk' },
              { icon: '⏰', text: 'Mon–Sat: 9am – 6pm' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.875rem', color: '#a09880' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 20px', background: '#25d366', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, maxWidth: 1200, margin: '0 auto', fontSize: '0.8rem', color: '#6b6050' }}>
        <span>© {new Date().getFullYear()} Al-Taqiyya Islamic Caps. All rights reserved.</span>
        <span style={{ fontFamily: 'Amiri, serif', color: 'var(--gold)', fontSize: '1rem' }}>﷽</span>
      </div>
    </footer>
  );
}
