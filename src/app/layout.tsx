import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Free GST Invoice Generator India | Pro Dashboard',
  description: 'Generate professional, GST-compliant invoices instantly. Auto-detects state from GSTIN, calculates CGST/SGST/IGST, and handles TDS. 100% free and private.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased text-gray-900">
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main Content Area with padding for the sidebar */}
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