import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZapBill | Free GST Invoice Generator & Cash Flow Tracker',
  description: 'ZapBill helps Indian freelancers generate GST-compliant invoices, track daily cash flow, and manage business finances. 100% free, private, and cloud-synced.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white font-sans antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}
