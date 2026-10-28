'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';

export default function MyInvoices() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setInvoices(data);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleDownload = (invoice: any) => {
    // Reconstruct the invoice data from the JSON column
    const invoiceData = invoice.invoice_data as InvoiceData;
    downloadPDF(invoiceData);
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading invoices...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Invoices</h1>

      {invoices.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-4">You haven't saved any invoices yet.</p>
          <a href="/" className="text-blue-600 font-bold hover:underline">Create your first invoice &rarr;</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <div className="col-span-3">Date</div>
            <div className="col-span-4">Client</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50">
                <div className="col-span-3 text-sm text-gray-600">{new Date(inv.created_at).toLocaleDateString('en-IN')}</div>
                <div className="col-span-4 font-medium text-gray-900">{inv.client_name || 'Unknown Client'}</div>
                <div className="col-span-3 font-bold text-gray-900">₹{inv.total_amount?.toFixed(2) || '0.00'}</div>
                <div className="col-span-2 flex justify-end gap-3">
                  <button 
                    onClick={() => handleDownload(inv)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    ⬇ PDF
                  </button>
                  <button 
                    onClick={() => deleteInvoice(inv.id)} 
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
