'use client';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

export default function Navbar() {
  const { publicKey, connect } = useWallet();
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#0f172a', color: '#f1f5f9' }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem' }}>RWA Marketplace</Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/listings">Browse</Link>
        <Link href="/borrow">Borrow</Link>
        <Link href="/portfolio">Portfolio</Link>
        <button
          onClick={connect}
          style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}
        >
          {publicKey ? `${publicKey.slice(0, 6)}…${publicKey.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
