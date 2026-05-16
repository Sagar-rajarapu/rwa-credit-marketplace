import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RWA Credit Marketplace',
  description: 'Fractionalized private credit & equipment financing on Stellar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
