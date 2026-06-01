import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  if (!loading && !user) { router.push('/auth/login'); return null; }
  if (loading) return <><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></>;

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setP = (f) => (e) => setPasswords(p => ({ ...p, [f]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone });
      toast.success('Profile updated!');
    } catch { toast.error('Error updating profile'); }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await axios.put(`${API}/auth/change-password`, { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  return (
    <>
      <Head><title>My Profile | Shazli Traders</title></Head>
      <Navbar />

      <div style={{ background: 'var(--emerald)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, margin: '0 auto 12px' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--white)', fontSize: '2rem' }}>{user?.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{user?.email}</p>
      </div>

      <div className="container" style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['profile', '👤 Profile'], ['password', '🔒 Password']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: tab === key ? 'var(--emerald)' : 'var(--white)', color: tab === key ? 'var(--white)' : 'var(--ink)', boxShadow: 'var(--shadow-sm)' }}>{label}</button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 20 }}>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', marginTop: 4 }}>Email cannot be changed</p>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+92 300 1234567" />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: 20 }}>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              {[
                { field: 'current', label: 'Current Password', key: 'current' },
                { field: 'newPass', label: 'New Password', key: 'newPass' },
                { field: 'confirm', label: 'Confirm New Password', key: 'confirm' },
              ].map(({ field, label, key }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input type="password" className="form-input" value={passwords[field]} onChange={setP(field)} required minLength={field !== 'current' ? 6 : 1} />
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Changing...' : 'Change Password'}</button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
