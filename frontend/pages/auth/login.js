import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === 'admin' ? '/admin/dashboard' : (router.query.redirect || '/'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <>
      <Head><title>Login | Shazli Traders</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--emerald)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)' }}>Shazli Traders</span>
          </Link>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* Card */}
            <div className="card" style={{ padding: '40px 36px' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: 4 }}>مرحباً بك</div>
                <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--ink)' }}>Welcome Back</h1>
                <p style={{ color: 'var(--ink-lt)', fontSize: '0.9rem', marginTop: 4 }}>Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" required
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid var(--cream-dk)', paddingTop: 24 }}>
                <p style={{ color: 'var(--ink-lt)', fontSize: '0.9rem' }}>
                  Don't have an account? <Link href="/auth/register" style={{ color: 'var(--emerald)', fontWeight: 700 }}>Register here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
