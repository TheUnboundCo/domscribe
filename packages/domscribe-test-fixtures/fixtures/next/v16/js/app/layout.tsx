import type { Metadata } from 'next';
import { DomscribeDevProvider } from '@domscribe/next/runtime';
import './globals.css';

export const metadata: Metadata = {
  title: 'Domscribe Test Fixture - Next.js 16',
  description: 'Test fixture for Domscribe transform validation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DomscribeDevProvider />
        {children}
      </body>
    </html>
  );
}
