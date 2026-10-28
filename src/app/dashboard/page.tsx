import InvoiceGenerator from '@/components/InvoiceGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Free GST Invoice Generator for Indian Freelancers
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Generate professional, GST-compliant invoices in seconds. No signup, no data tracking, 100% free.
          </p>
        </div>
        
        <InvoiceGenerator />
        
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">✨ Trusted by 1000+ Indian Freelancers</p>
          <p className="text-sm">100% Client-Side • Your Data Never Leaves Your Browser • GST Compliant</p>
        </div>
      </div>
    </main>
  );
}