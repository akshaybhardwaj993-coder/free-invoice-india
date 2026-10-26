'use client';
import { useState } from 'react';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';

export default function InvoiceGenerator() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessGSTIN: '',
    clientName: '',
    clientAddress: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
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
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const total = subtotal + cgst + sgst;
    return { subtotal, cgst, sgst, total };
  };

  const handleDownload = () => {
    const totals = calculateTotals();
    const invoiceData: InvoiceData = {
      ...formData,
      items,
      ...totals
    };
    downloadPDF(invoiceData);
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Generate Your Free Invoice</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Business Name *" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Business Address" value={formData.businessAddress} onChange={(e) => setFormData({...formData, businessAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="GSTIN (Optional)" value={formData.businessGSTIN} onChange={(e) => setFormData({...formData, businessGSTIN: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Client Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Client Name *" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Client Address" value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
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
        <div className="flex justify-between mb-2"><span className="text-gray-600">CGST (9%):</span><span className="font-semibold">{totals.cgst.toFixed(2)}</span></div>
        <div className="flex justify-between mb-2"><span className="text-gray-600">SGST (9%):</span><span className="font-semibold">₹{totals.sgst.toFixed(2)}</span></div>
        <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span className="text-blue-600">₹{totals.total.toFixed(2)}</span></div>
      </div>

      <button onClick={handleDownload} disabled={!formData.businessName || !formData.clientName || items.some(i => !i.description)} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
        Download Free GST Invoice PDF
      </button>
    </div>
  );
}