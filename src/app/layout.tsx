import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Free GST Invoice Generator India | No Signup Required',
  description: 'Generate professional, GST-compliant invoices instantly. Auto-detects state from GSTIN, calculates CGST/SGST/IGST, and handles TDS. 100% free and private.',
  openGraph: {
    title: 'Free GST Invoice Generator India',
    description: 'The fastest way for Indian freelancers to create GST-compliant PDF invoices. No signup, 100% private.',
    url: 'https://free-invoice-india.vercel.app',
    siteName: 'Free Invoice India',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 flex flex-col min-h-screen font-sans antialiased">
        <nav className="bg-white border-b border-gray-200 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-blue-600">Free Invoice India</a>
            <div className="flex gap-4">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Invoice Generator</a>
              <a href="/cashflow" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Cash Flow</a>
            </div>
          </div>
        </nav>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="mt-auto py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
          <p className="mb-2">
            © 2026 Free Invoice India. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mb-2">
            <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="mailto:your-email@gmail.com" className="hover:text-blue-600 transition-colors">Contact Support</a>
          </div>
          <p className="text-xs text-gray-400">
            Made with ❤️ for Indian Freelancers. Your data never leaves your browser.
          </p>
        </footer>
      </body>
    </html>
  );
}