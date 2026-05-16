'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { publicKey, connect } = useWallet();
  const [listing, setListing] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.getListing(Number(id)).then(setListing).catch(() => setListing(null));
  }, [id]);

  async function handleInvest() {
    if (!publicKey) { await connect(); return; }
    if (!amount || isNaN(Number(amount))) return;
    setStatus('Submitting…');
    try {
      // In production: build & sign Soroban tx here, then record off-chain
      await api.recordInvestment({
        listing_id: listing.listing_id,
        investor_address: publicKey,
        amount: Math.round(Number(amount) * 1e7),
        tx_hash: 'pending',
      });
      setStatus('Investment recorded! Complete the transaction in Freighter.');
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  if (!listing) return <><Navbar /><p style={{ padding: '2rem' }}>Loading…</p></>;

  const apy = (listing.interest_bps / 100).toFixed(1);
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 640, margin: '3rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>{listing.title}</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{listing.description}</p>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', fontSize: 15 }}>
          <span>Target: <strong>{(listing.target_amount / 1e7).toLocaleString()} XLM</strong></span>
          <span>APY: <strong style={{ color: '#16a34a' }}>{apy}%</strong></span>
          <span>Term: <strong>{listing.duration_days} days</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Amount (XLM)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1', width: 160 }}
          />
          <button
            onClick={handleInvest}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}
          >
            Invest
          </button>
        </div>
        {status && <p style={{ marginTop: '1rem', color: '#475569' }}>{status}</p>}
      </main>
    </>
  );
}
