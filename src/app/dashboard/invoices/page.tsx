'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Eye, X, Download } from 'lucide-react';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setInvoices(data);
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  const handleViewPDF = (inv: any) => {
    const data = inv.invoice_data;
    if (!data) return;
    // Construct minimal data object for PDF generator
    const pdfData: InvoiceData = {
      businessName: 'My Business', // You can pull this from local storage if needed
      businessAddress: '',
      businessGSTIN: '',
      businessState: '',
      clientName: inv.client_name,
      clientAddress: '',
      clientGSTIN: '',
      clientState: '',
      invoiceNumber: inv.invoice_number,
      invoiceDate: inv.invoice_date,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      cgst: data.cgst || 0,
      sgst: data.sgst || 0,
      igst: data.igst || 0,
      tds: data.tds || 0,
      tdsRate: data.tdsRate || 0,
      amountPayable: data.amountPayable || data.total || 0,
      total: data.total || 0,
      currency: '₹',
      isExport: false
    };
    downloadPDF(pdfData);
  };

  if (loading) return <div className="p-10">Loading invoices...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Invoices</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {invoices.map((inv) => {
                const total = inv.invoice_data?.total || 0;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{inv.invoice_date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{inv.client_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => setViewInvoice(inv)} className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button onClick={() => handleViewPDF(inv)} className="text-green-600 hover:text-green-800 font-medium text-sm inline-flex items-center gap-1">
                        <Download className="w-4 h-4" /> PDF
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-800 font-medium text-sm inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No invoices found. Create one to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
              <button onClick={() => setViewInvoice(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Invoice Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewInvoice.invoice_date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Client</p>
                  <p className="font-medium text-gray-900 dark:text-white">{viewInvoice.client_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                  <p className="font-bold text-blue-600 text-lg">₹{(viewInvoice.invoice_data?.total || 0).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Items</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  {viewInvoice.invoice_data?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">{item.description || 'Item'}</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{item.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setViewInvoice(null)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button onClick={() => { handleViewPDF(viewInvoice); setViewInvoice(null); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
