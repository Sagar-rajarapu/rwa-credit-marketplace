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
  const [fetchError, setFetchError] = useState(false);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.getListing(Number(id))
      .then(setListing)
      .catch(() => setFetchError(true));
  }, [id]);

  async function handleInvest() {
    if (!publicKey) { await connect(); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setStatus('Submitting…');
    try {
      // TODO: build & sign Soroban tx, then pass real tx_hash here
      await api.recordInvestment({
        listing_id: listing.listing_id,
        investor_address: publicKey,
        amount: Math.round(Number(amount) * 1e7),
        tx_hash: 'pending', // replace with actual hash after on-chain tx
      });
      setStatus('Investment recorded! Complete the transaction in Freighter.');
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  if (fetchError) return <><Navbar /><p style={{ padding: '2rem', color: '#ef4444' }}>Listing not found.</p></>;
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
            min="0"
            placeholder="Amount (XLM)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #cbd5e1', width: 160 }}
          />
          <button
            onClick={handleInvest}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}
          >
            {publicKey ? 'Invest' : 'Connect Wallet'}
          </button>
        </div>
        {status && <p style={{ marginTop: '1rem', color: '#475569' }}>{status}</p>}
      </main>
    </>
  );
}
