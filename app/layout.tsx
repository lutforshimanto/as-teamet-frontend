import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/lib/redux/provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'AS-Teamet | Moving, Cleaning & Construction Services in Denmark',
  description:
    'AS-Teamet delivers professional moving, cleaning, construction, and garbage collection services across Denmark. Reliable teams, fair prices, quality work.',
  openGraph: {
    title: 'AS-Teamet | Professional Services in Denmark',
    description:
      'Moving, cleaning, construction, and garbage collection services across Denmark.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
