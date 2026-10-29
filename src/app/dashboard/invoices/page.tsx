'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Eye, X, Download, Edit3, Save } from 'lucide-react';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [editForm, setEditForm] = useState({ clientName: '', invoiceDate: '', items: [] as any[] });
  const router = useRouter();

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data } = await supabase
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

  const openEdit = (inv: any) => {
    setEditInvoice(inv);
    setEditForm({
      clientName: inv.client_name || '',
      invoiceDate: inv.invoice_date || new Date().toISOString().split('T')[0],
      items: inv.invoice_data?.items || [{ description: '', hsn: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const updateEditItem = (index: number, field: string, value: any) => {
    const newItems = [...editForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
    }
    setEditForm({ ...editForm, items: newItems });
  };

  const addEditItem = () => {
    setEditForm({ ...editForm, items: [...editForm.items, { description: '', hsn: '', quantity: 1, rate: 0, amount: 0 }] });
  };

  const removeEditItem = (index: number) => {
    if (editForm.items.length > 1) {
      setEditForm({ ...editForm, items: editForm.items.filter((_, i) => i !== index) });
    }
  };

  const saveEdit = async () => {
    const subtotal = editForm.items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
    const total = subtotal;
    
    const { error } = await supabase
      .from('invoices')
      .update({
        client_name: editForm.clientName,
        invoice_date: editForm.invoiceDate,
        invoice_data: { ...editInvoice.invoice_data, items: editForm.items, subtotal, total }
      })
      .eq('id', editInvoice.id);

    if (error) {
      alert('Error saving: ' + error.message);
      return;
    }

    setInvoices(invoices.map(inv => 
      inv.id === editInvoice.id 
        ? { ...inv, client_name: editForm.clientName, invoice_date: editForm.invoiceDate, invoice_data: { ...inv.invoice_data, items: editForm.items, subtotal, total } }
        : inv
    ));
    setEditInvoice(null);
    alert('Invoice updated successfully!');
  };

  const handleViewPDF = (inv: any) => {
    const data = inv.invoice_data;
    if (!data) return;
    const pdfData: InvoiceData = {
      businessName: 'My Business',
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
        <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const total = inv.invoice_data?.total || 0;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.invoice_date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.client_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">₹{total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setViewInvoice(inv)} className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button onClick={() => openEdit(inv)} className="text-orange-600 hover:text-orange-800 font-medium text-sm inline-flex items-center gap-1">
                        <Edit3 className="w-4 h-4" /> Edit
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
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                <p className="text-xs text-blue-600 font-semibold mt-1">TAX INVOICE</p>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 uppercase">Invoice Number</p><p className="font-medium">{viewInvoice.invoice_number}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Date</p><p className="font-medium">{viewInvoice.invoice_date}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Client</p><p className="font-medium">{viewInvoice.client_name}</p></div>
                <div><p className="text-xs text-gray-500 uppercase">Total Amount</p><p className="font-bold text-blue-600 text-lg">₹{(viewInvoice.invoice_data?.total || 0).toFixed(2)}</p></div>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Items</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  {viewInvoice.invoice_data?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <span className="text-gray-700">{item.description || 'Item'}</span>
                        {item.hsn && <span className="text-xs text-gray-500 ml-2">HSN: {item.hsn}</span>}
                      </div>
                      <span className="font-medium">₹{item.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setViewInvoice(null)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Close</button>
              <button onClick={() => { handleViewPDF(viewInvoice); setViewInvoice(null); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Tax Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-orange-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Invoice</h2>
                <p className="text-xs text-orange-600 font-semibold mt-1">{editInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setEditInvoice(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Client Name</label>
                  <input type="text" value={editForm.clientName} onChange={(e) => setEditForm({...editForm, clientName: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Invoice Date</label>
                  <input type="date" value={editForm.invoiceDate} onChange={(e) => setEditForm({...editForm, invoiceDate: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Items</label>
                  <button onClick={addEditItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {editForm.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                      <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateEditItem(idx, 'description', e.target.value)} className="col-span-5 px-2 py-1 border border-gray-300 rounded text-sm" />
                      <input type="text" placeholder="HSN" value={item.hsn} onChange={(e) => updateEditItem(idx, 'hsn', e.target.value)} className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm" />
                      <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateEditItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm" />
                      <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateEditItem(idx, 'rate', parseFloat(e.target.value) || 0)} className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm" />
                      <div className="col-span-1 text-right font-semibold text-sm">₹{(item.amount || 0).toFixed(2)}</div>
                      <button onClick={() => removeEditItem(idx)} className="col-span-1 text-red-500 hover:text-red-700 text-sm">×</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-bold text-blue-600">₹{editForm.items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setEditInvoice(null)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
