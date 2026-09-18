import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/firebase/context';

export const metadata: Metadata = {
  title: 'ShipScan — Test Your Product Before Your First Users',
  description:
    'First-user readiness engine. Test your product before your first users do.',
  openGraph: {
    title: 'ShipScan — Test Your Product Before Your First Users',
    description:
      'First-user readiness engine. Test your product before your first users do.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShipScan — Test Your Product Before Your First Users',
    description:
      'First-user readiness engine. Test your product before your first users do.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
