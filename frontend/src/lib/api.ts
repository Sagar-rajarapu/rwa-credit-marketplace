const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getListings: (status = 'open') => apiFetch(`/listings?status=${status}`),
  getListing: (id: number) => apiFetch(`/listings/${id}`),
  createListing: (data: object) => apiFetch('/listings', { method: 'POST', body: JSON.stringify(data) }),
  getInvestments: (investor: string) => apiFetch(`/investments?investor=${investor}`),
  recordInvestment: (data: object) => apiFetch('/investments', { method: 'POST', body: JSON.stringify(data) }),
  upsertUser: (data: object) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
};
