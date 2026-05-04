import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to Al-Taqiyya!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <Head><title>Register | Al-Taqiyya</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--emerald)', padding: '20px 24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>Al-Taqiyya</span>
          </Link>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 460 }}>
            <div className="card" style={{ padding: '40px 36px' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: 4 }}>إنشاء حساب</div>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem' }}>Create Account</h1>
                <p style={{ color: 'var(--ink-lt)', fontSize: '0.9rem', marginTop: 4 }}>Join the Al-Taqiyya family</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" placeholder="Ahmad Ali" required value={form.name} onChange={update('name')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" placeholder="+92 300..." value={form.phone} onChange={update('phone')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" placeholder="you@example.com" required value={form.email} onChange={update('email')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" placeholder="Min 6 chars" required value={form.password} onChange={update('password')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input type="password" className="form-input" placeholder="Repeat password" required value={form.confirm} onChange={update('confirm')} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid var(--cream-dk)', paddingTop: 24 }}>
                <p style={{ color: 'var(--ink-lt)', fontSize: '0.9rem' }}>
                  Already have an account? <Link href="/auth/login" style={{ color: 'var(--emerald)', fontWeight: 700 }}>Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
