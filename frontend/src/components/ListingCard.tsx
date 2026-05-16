import Link from 'next/link';

interface Listing {
  listing_id: number;
  title: string;
  asset_type: string;
  target_amount: number;
  interest_bps: number;
  duration_days: number;
  status: string;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const apy = (listing.interest_bps / 100).toFixed(1);
  const amount = (listing.target_amount / 1e7).toLocaleString();
  return (
    <Link href={`/listings/${listing.listing_id}`}>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', background: '#fff', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{listing.title}</span>
          <span style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 8px', borderRadius: 99 }}>{listing.asset_type}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: 14, color: '#475569' }}>
          <span>Target: <strong>{amount} XLM</strong></span>
          <span>APY: <strong style={{ color: '#16a34a' }}>{apy}%</strong></span>
          <span>Term: <strong>{listing.duration_days}d</strong></span>
        </div>
      </div>
    </Link>
  );
}
