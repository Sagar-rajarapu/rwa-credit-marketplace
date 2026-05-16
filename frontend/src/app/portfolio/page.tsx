'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';

export default function PortfolioPage() {
  const { publicKey, connect } = useWallet();
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    if (publicKey) api.getInvestments(publicKey).then(setInvestments).catch(() => {});
  }, [publicKey]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Portfolio</h2>
        {!publicKey ? (
          <button onClick={connect} style={{ padding: '0.6rem 1.5rem', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>
            Connect Wallet to View
          </button>
        ) : investments.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No investments yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Asset</th>
                <th style={{ padding: '0.5rem' }}>Amount (XLM)</th>
                <th style={{ padding: '0.5rem' }}>APY</th>
                <th style={{ padding: '0.5rem' }}>Term</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem' }}>{inv.title}</td>
                  <td style={{ padding: '0.5rem' }}>{(inv.amount / 1e7).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', color: '#16a34a' }}>{(inv.interest_bps / 100).toFixed(1)}%</td>
                  <td style={{ padding: '0.5rem' }}>{inv.duration_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
