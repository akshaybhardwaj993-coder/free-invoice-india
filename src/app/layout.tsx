import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ZapBill | Free GST Invoice Generator & Cash Flow Tracker',
  description: 'ZapBill helps Indian freelancers generate GST-compliant invoices, track daily cash flow, and manage business finances. 100% free, private, and cloud-synced.',
  openGraph: {
    title: 'ZapBill - The Fastest Invoice Generator for India',
    description: 'Generate professional GST invoices and track cash flow in seconds. No signup required.',
    url: 'https://zapbill.vercel.app',
    siteName: 'ZapBill',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased text-gray-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}