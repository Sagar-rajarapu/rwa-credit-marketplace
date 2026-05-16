import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          Fractionalized Equipment Financing
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '2.5rem' }}>
          SMEs tokenize real-world assets on Stellar. Global investors fund loans and earn yield.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/listings">
            <button style={{ padding: '0.75rem 2rem', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
              Browse Listings
            </button>
          </Link>
          <Link href="/borrow">
            <button style={{ padding: '0.75rem 2rem', borderRadius: 8, border: '1px solid #6366f1', background: '#fff', color: '#6366f1', fontSize: '1rem', cursor: 'pointer' }}>
              List an Asset
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
