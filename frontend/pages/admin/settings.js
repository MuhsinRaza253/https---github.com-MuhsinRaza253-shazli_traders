import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bankName: '', accountTitle: '', accountNumber: '', iban: '', paymentInstructions: '',
    deliveryCharge: 200, freeShippingThreshold: 3000,
    contactAddress: '', contactPhone: '', contactEmail: '', contactHours: '', whatsappNumber: '',
  });

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(({ data }) => setForm(f => ({ ...f, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, form);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving settings');
    }
    setSaving(false);
  };

  const card = { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 24 };
  const heading = { fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: 4 };
  const sub = { fontSize: '0.85rem', color: 'var(--ink-lt)', marginBottom: 20 };

  return (
    <>
      <Head><title>Settings | Admin</title></Head>
      <AdminLayout title="Store Settings">
        {loading ? <div className="spinner" style={{ margin: 40 }} /> : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>

            {/* Payment account details */}
            <div style={card}>
              <h3 style={heading}>💳 Advance / Online Payment Account</h3>
              <p style={sub}>These details are shown to customers who choose to pay in advance at checkout.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Bank / Wallet Name</label>
                  <input className="form-input" placeholder="e.g. Meezan Bank / JazzCash" value={form.bankName} onChange={set('bankName')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Title</label>
                  <input className="form-input" placeholder="e.g. Shazli Traders" value={form.accountTitle} onChange={set('accountTitle')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input className="form-input" placeholder="e.g. 0123456789012" value={form.accountNumber} onChange={set('accountNumber')} />
                </div>
                <div className="form-group">
                  <label className="form-label">IBAN (optional)</label>
                  <input className="form-input" placeholder="e.g. PK00MEZN0000000123456789" value={form.iban} onChange={set('iban')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Instructions (optional)</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Transfer the total amount and upload the screenshot at checkout. Orders are dispatched once payment is confirmed." value={form.paymentInstructions} onChange={set('paymentInstructions')} />
              </div>
            </div>

            {/* Delivery charges */}
            <div style={card}>
              <h3 style={heading}>🚚 Delivery Charges</h3>
              <p style={sub}>Set the flat delivery charge and the order amount above which delivery becomes free.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Delivery Charge (PKR)</label>
                  <input type="number" min="0" className="form-input" value={form.deliveryCharge} onChange={set('deliveryCharge')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Free Delivery Above (PKR)</label>
                  <input type="number" min="0" className="form-input" value={form.freeShippingThreshold} onChange={set('freeShippingThreshold')} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', marginTop: 4 }}>Set to 0 to never offer free delivery.</p>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div style={card}>
              <h3 style={heading}>📞 Storefront Contact Details</h3>
              <p style={sub}>Shown in the website footer and the WhatsApp button.</p>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="e.g. Rawalpindi, Punjab, Pakistan" value={form.contactAddress} onChange={set('contactAddress')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="e.g. +92 300 1234567" value={form.contactPhone} onChange={set('contactPhone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" placeholder="e.g. info@altaqiyya.pk" value={form.contactEmail} onChange={set('contactEmail')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Business Hours</label>
                  <input className="form-input" placeholder="e.g. Mon–Sat: 9am – 6pm" value={form.contactHours} onChange={set('contactHours')} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number (digits only)</label>
                  <input className="form-input" placeholder="e.g. 923001234567" value={form.whatsappNumber} onChange={set('whatsappNumber')} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-lt)', marginTop: 4 }}>Country code + number, no spaces or +.</p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              {saving ? '⏳ Saving...' : '✓ Save Settings'}
            </button>
          </form>
        )}
      </AdminLayout>
    </>
  );
}
