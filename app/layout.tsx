import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LaunchProof — Test Your Product Before Your First Users',
  description:
    'First-user readiness engine. Test your product like a first-time user, find launch blockers, understand why they matter, and know what to fix next with evidence-backed fixes.',
  openGraph: {
    title: 'LaunchProof — Test Your Product Before Your First Users',
    description:
      'First-user readiness engine. Test your product like a first-time user, find launch blockers, understand why they matter, and know what to fix next with evidence-backed fixes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchProof — Test Your Product Before Your First Users',
    description:
      'First-user readiness engine. Test your product like a first-time user, find launch blockers, understand why they matter, and know what to fix next with evidence-backed fixes.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
