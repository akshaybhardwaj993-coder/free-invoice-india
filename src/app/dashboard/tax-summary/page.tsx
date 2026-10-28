'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Receipt, TrendingUp, Percent, FileText } from 'lucide-react';

export default function TaxSummary() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Current Month (YYYY-MM)
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }
      setUser(user);

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });

      if (data) setInvoices(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter invoices for the selected month
  const monthlyInvoices = invoices.filter(inv => inv.invoice_date?.startsWith(selectedMonth));

  // Calculate Totals
  const totals = monthlyInvoices.reduce((acc, inv) => {
    const data = inv.invoice_data;
    if (!data) return acc;
    return {
      revenue: acc.revenue + (data.subtotal || 0),
      cgst: acc.cgst + (data.cgst || 0),
      sgst: acc.sgst + (data.sgst || 0),
      igst: acc.igst + (data.igst || 0),
      tds: acc.tds + (data.tds || 0),
      total: acc.total + (data.total || 0),
    };
  }, { revenue: 0, cgst: 0, sgst: 0, igst: 0, tds: 0, total: 0 });

  const totalGST = totals.cgst + totals.sgst + totals.igst;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading tax data...</div>;

  // Generate list of unique months from invoices for the dropdown
  const availableMonths = Array.from(new Set(invoices.map(inv => inv.invoice_date?.slice(0, 7)))).sort().reverse();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Tax Summary</h1>
          <p className="text-gray-500 mt-1">Automated GST & TDS calculations for your filings.</p>
        </div>
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm font-medium"
        >
          {availableMonths.length > 0 ? (
            availableMonths.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)
          ) : (
            <option value={selectedMonth}>{new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
          )}
        </select>
      </div>

      {monthlyInvoices.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices found for this month.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{totals.revenue.toFixed(2)}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Percent className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-500 font-medium">Total GST Collected</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">₹{totalGST.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">CGST: ₹{totals.cgst.toFixed(2)} | SGST: ₹{totals.sgst.toFixed(2)} | IGST: ₹{totals.igst.toFixed(2)}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-gray-500 font-medium">Total TDS Deducted</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">₹{totals.tds.toFixed(2)}</p>
            </div>

            <div className="bg-blue-600 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="w-5 h-5 text-blue-200" />
                <p className="text-sm text-blue-100 font-medium">Total Billed</p>
              </div>
              <p className="text-2xl font-bold">₹{totals.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Invoice List for the Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 bg-gray-50">
              Invoices for {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3 text-right">Taxable Value</th>
                    <th className="px-6 py-3 text-right">GST</th>
                    <th className="px-6 py-3 text-right">TDS</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyInvoices.map((inv) => {
                    const d = inv.invoice_data;
                    const gst = (d?.cgst || 0) + (d?.sgst || 0) + (d?.igst || 0);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">{inv.invoice_date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{inv.client_name}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">₹{d?.subtotal?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 text-sm text-right text-purple-600">₹{gst.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-right text-orange-600">₹{d?.tds?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">₹{d?.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
