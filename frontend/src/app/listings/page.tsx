import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ListingsPage() {
  let listings: any[] = [];
  try {
    listings = await api.getListings('open');
  } catch {
    // API may not be running during build
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Open Listings</h2>
        {listings.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No open listings yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {listings.map((l) => <ListingCard key={l.listing_id} listing={l} />)}
          </div>
        )}
      </main>
    </>
  );
}
