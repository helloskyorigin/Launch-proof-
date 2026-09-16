import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LaunchProof',
  description: 'Mobile-first SaaS for testing and checking products before real users do.',
  openGraph: {
    title: 'LaunchProof',
    description: 'Mobile-first SaaS for testing and checking products before real users do.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchProof',
    description: 'Mobile-first SaaS for testing and checking products before real users do.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
