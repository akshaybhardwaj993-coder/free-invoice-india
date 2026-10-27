'use client';
import { useState, useEffect } from 'react';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';

// Mapping of GSTIN State Codes to State Names
const stateCodes: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
  '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
  '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana', '37': 'Andhra Pradesh (New)'
};

export default function InvoiceGenerator() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessGSTIN: '',
    businessState: '',
    clientName: '',
    clientAddress: '',
    clientState: 'Maharashtra', // Default client state
    invoiceNumber: 'INV-000000',
    invoiceDate: 'YYYY-MM-DD',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
    }));
  }, []);

  // Auto-detect state from GSTIN
  useEffect(() => {
    const gstin = formData.businessGSTIN.trim().toUpperCase();
    if (gstin.length >= 4) {
      const code = gstin.substring(2, 4);
      const state = stateCodes[code] || '';
      if (state && state !== formData.businessState) {
        setFormData(prev => ({ ...prev, businessState: state }));
      }
    } else {
      if (formData.businessState) {
        setFormData(prev => ({ ...prev, businessState: '' }));
      }
    }
  }, [formData.businessGSTIN]);

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const addItem = () => setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.18; // 18% Total GST
    const totalTax = subtotal * taxRate;
    
    let cgst = 0, sgst = 0, igst = 0;

    // Intra-state vs Inter-state logic
    if (formData.businessState && formData.clientState && formData.businessState !== formData.clientState) {
      igst = totalTax; // Inter-state: IGST
    } else {
      cgst = totalTax / 2; // Intra-state: CGST + SGST
      sgst = totalTax / 2;
    }

    const total = subtotal + totalTax;
    return { subtotal, cgst, sgst, igst, total };
  };

  const handleDownload = () => {
    window.open('https://uplcm.com/4/12129654', '_blank');
    const totals = calculateTotals();
    const invoiceData: InvoiceData = { ...formData, items, ...totals };
    downloadPDF(invoiceData);
  };

  const totals = calculateTotals();
  const isInterState = formData.businessState !== '' && formData.clientState !== '' && formData.businessState !== formData.clientState;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Generate Your Free GST Invoice</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Business Name *" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Business Address" value={formData.businessAddress} onChange={(e) => setFormData({...formData, businessAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="GSTIN (Auto-detects State)" value={formData.businessGSTIN} onChange={(e) => setFormData({...formData, businessGSTIN: e.target.value.toUpperCase()})} className="px-4 py-2 border border-gray-300 rounded-lg" maxLength={15} />
          <input type="text" placeholder="State (Auto-detected)" value={formData.businessState} readOnly className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Client Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Client Name *" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Client Address" value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <select value={formData.clientState} onChange={(e) => setFormData({...formData, clientState: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2">
            <option value="">Select Client State</option>
            {Object.values(stateCodes).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Invoice Number" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="date" placeholder="Invoice Date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Items/Services</h3>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-center">
            <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg" min="1" />
            <input type="number" placeholder="Rate (₹)" value={item.rate || ''} onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg" min="0" />
            <div className="col-span-2 px-3 py-2 bg-gray-50 rounded-lg text-right font-semibold">₹{item.amount.toFixed(2)}</div>
            <button onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700 font-bold" disabled={items.length === 1}>×</button>
          </div>
        ))}
        <button onClick={addItem} className="text-blue-600 hover:text-blue-700 font-medium text-sm">+ Add Item</button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span></div>
        {isInterState ? (
          <div className="flex justify-between mb-2"><span className="text-gray-600">IGST (18%):</span><span className="font-semibold">₹{totals.igst.toFixed(2)}</span></div>
        ) : (
          <>
            <div className="flex justify-between mb-2"><span className="text-gray-600">CGST (9%):</span><span className="font-semibold">{totals.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span className="text-gray-600">SGST (9%):</span><span className="font-semibold">₹{totals.sgst.toFixed(2)}</span></div>
          </>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span className="text-blue-600">{totals.total.toFixed(2)}</span></div>
        {formData.businessState && formData.clientState && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            {isInterState ? 'Inter-State Supply (IGST Applied)' : 'Intra-State Supply (CGST + SGST Applied)'}
          </p>
        )}
      </div>

      <button onClick={handleDownload} disabled={!formData.businessName || !formData.clientName || items.some(i => !i.description)} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
        Download Free GST Invoice PDF
      </button>
    </div>
  );
}
