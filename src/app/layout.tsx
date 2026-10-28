import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'ZapBill | Free GST Invoice Generator & Cash Flow Tracker',
  description: 'ZapBill helps Indian freelancers generate GST-compliant invoices, track daily cash flow, and manage business finances. 100% free, private, and cloud-synced.',
  openGraph: {
    title: 'ZapBill - The Fastest Invoice Generator for India',
    description: 'Generate professional GST invoices and track cash flow in seconds.',
    url: 'https://zapbill.vercel.app',
    siteName: 'ZapBill',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white font-sans antialiased text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
