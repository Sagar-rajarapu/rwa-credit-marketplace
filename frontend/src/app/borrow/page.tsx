'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';

export default function BorrowPage() {
  const { publicKey, connect } = useWallet();
  const [form, setForm] = useState({
    listing_id: '',
    title: '',
    description: '',
    asset_type: 'machinery',
    target_amount: '',
    interest_bps: '',
    duration_days: '',
  });
  const [status, setStatus] = useState('');

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) { await connect(); return; }
    if (!form.listing_id) {
      setStatus('Enter the on-chain listing ID returned by the marketplace contract.');
      return;
    }
    setStatus('Submitting…');
    try {
      await api.createListing({
        listing_id: parseInt(form.listing_id, 10),
        borrower_address: publicKey,
        title: form.title,
        description: form.description,
        asset_type: form.asset_type,
        target_amount: Math.round(Number(form.target_amount) * 1e7),
        interest_bps: Number(form.interest_bps),
        duration_days: Number(form.duration_days),
      });
      setStatus('Listing created!');
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  const field = (label: string, key: string, type = 'text') => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
      {label}
      <input
        type={type}
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
      />
    </label>
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 520, margin: '3rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>List an Asset</h2>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: '1.5rem' }}>
          First call <code>list_asset</code> on the marketplace contract, then enter the returned listing ID below.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {field('On-chain Listing ID', 'listing_id', 'number')}
          {field('Title', 'title')}
          {field('Description', 'description')}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            Asset Type
            <select value={form.asset_type} onChange={e => set('asset_type', e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
              <option value="machinery">Machinery</option>
              <option value="fleet">Fleet</option>
              <option value="hardware">Hardware</option>
            </select>
          </label>
          {field('Target Amount (XLM)', 'target_amount', 'number')}
          {field('Interest (basis points, e.g. 800 = 8%)', 'interest_bps', 'number')}
          {field('Duration (days)', 'duration_days', 'number')}
          <button type="submit" style={{ padding: '0.65rem', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            {publicKey ? 'Create Listing' : 'Connect Wallet'}
          </button>
          {status && <p style={{ color: '#475569', fontSize: 13 }}>{status}</p>}
        </form>
      </main>
    </>
  );
}
