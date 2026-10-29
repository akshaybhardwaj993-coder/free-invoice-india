'use client';
import { useState, useEffect } from 'react';
import { downloadPDF, InvoiceData } from '@/lib/pdf-generator';
import { supabase } from '@/utils/supabase/client';
import { Upload, Palette, Users, RefreshCw, LayoutGrid, FileText } from 'lucide-react';

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
  const [user, setUser] = useState<any>(null);
  const [savedClients, setSavedClients] = useState<any[]>([]);
  
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [businessLogo, setBusinessLogo] = useState<string>('');
  const [templateStyle, setTemplateStyle] = useState<'modern' | 'traditional'>('modern');

  const [formData, setFormData] = useState({
    businessName: '', businessAddress: '', businessGSTIN: '', businessState: '',
    clientName: '', clientAddress: '', clientGSTIN: '', clientState: 'Maharashtra',
    invoiceNumber: 'INV-000000', invoiceDate: 'YYYY-MM-DD',
    // Traditional Fields
    deliveryNote: '', buyersOrderNo: '', despatchDocNo: '', termsOfDelivery: 'ON DISPATCH',
  });

  const [tdsRate, setTdsRate] = useState<number>(0);
  const [isExport, setIsExport] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const randomInv = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setFormData(prev => ({ ...prev, invoiceNumber: randomInv, invoiceDate: today }));

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('clients').select('*').eq('user_id', user.id).order('name').then(({ data }) => {
          if (data) setSavedClients(data);
        });
      }
    });
    
    const savedBrand = localStorage.getItem('zapbill_brand_settings');
    if (savedBrand) {
      const parsed = JSON.parse(savedBrand);
      if (parsed.brandColor) setBrandColor(parsed.brandColor);
      if (parsed.businessLogo) setBusinessLogo(parsed.businessLogo);
    }

    const savedBusiness = localStorage.getItem('invoice_business_details');
    if (savedBusiness) {
      const parsed = JSON.parse(savedBusiness);
      setFormData(prev => ({ ...prev, businessName: parsed.businessName || '', businessAddress: parsed.businessAddress || '', businessGSTIN: parsed.businessGSTIN || '' }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zapbill_brand_settings', JSON.stringify({ brandColor, businessLogo }));
  }, [brandColor, businessLogo]);

  useEffect(() => {
    if (formData.businessName || formData.businessAddress || formData.businessGSTIN) {
      localStorage.setItem('invoice_business_details', JSON.stringify({ businessName: formData.businessName, businessAddress: formData.businessAddress, businessGSTIN: formData.businessGSTIN }));
    }
  }, [formData.businessName, formData.businessAddress, formData.businessGSTIN]);

  useEffect(() => {
    const gstin = formData.businessGSTIN.trim().toUpperCase();
    if (gstin.length >= 4) {
      const code = gstin.substring(2, 4);
      const state = stateCodes[code] || '';
      if (state && state !== formData.businessState) setFormData(prev => ({ ...prev, businessState: state }));
    }
  }, [formData.businessGSTIN]);

  const [items, setItems] = useState([{ description: '', hsn: '', quantity: 1, rate: 0, amount: 0 }]);

  const addItem = () => setItems([...items, { description: '', hsn: '', quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.18; 
    const totalTax = isExport ? 0 : subtotal * taxRate;
    let cgst = 0, sgst = 0, igst = 0;
    if (!isExport) {
      if (formData.businessState && formData.clientState && formData.businessState !== formData.clientState) igst = totalTax; 
      else { cgst = totalTax / 2; sgst = totalTax / 2; }
    }
    const total = subtotal + totalTax;
    const tds = (subtotal * tdsRate) / 100;
    const amountPayable = total - tds;
    const currency = isExport ? '$' : '₹';
    return { subtotal, cgst, sgst, igst, tds, amountPayable, total, currency };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBusinessLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClientSelect = (clientId: string) => {
    if (!clientId) return;
    const client = savedClients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.name,
        clientGSTIN: client.gstin || '',
        clientAddress: client.address || '',
        clientState: client.state || prev.clientState
      }));
    }
  };

  const handleDownload = () => {
    const totals = calculateTotals();
    downloadPDF({ ...formData, items, ...totals, tdsRate, isExport, businessLogo, brandColor, templateStyle } as InvoiceData);
  };

  const totals = calculateTotals();
  const isInterState = !isExport && formData.businessState !== '' && formData.clientState !== '' && formData.businessState !== formData.clientState;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Palette className="w-4 h-4" /> Brand & Template Settings</h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Brand Color:</label>
            <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Business Logo:</label>
            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 text-sm">
              <Upload className="w-4 h-4" />
              {businessLogo ? 'Change Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {businessLogo && <button onClick={() => setBusinessLogo('')} className="text-xs text-red-500 hover:underline">Remove</button>}
          </div>
          
          {/* Template Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Template:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button 
                onClick={() => setTemplateStyle('modern')}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${templateStyle === 'modern' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
              >
                <LayoutGrid className="w-3 h-3" /> Modern
              </button>
              <button 
                onClick={() => setTemplateStyle('traditional')}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${templateStyle === 'traditional' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
              >
                <FileText className="w-3 h-3" /> Traditional
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Generate Your Free Invoice</h2>
        <label className="flex items-center space-x-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <input type="checkbox" checked={isExport} onChange={(e) => setIsExport(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm font-medium text-blue-700">Export Invoice (No GST, USD)</span>
        </label>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Business Name *" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Business Address" value={formData.businessAddress} onChange={(e) => setFormData({...formData, businessAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Business GSTIN (Auto-detects State)" value={formData.businessGSTIN} onChange={(e) => setFormData({...formData, businessGSTIN: e.target.value.toUpperCase()})} className="px-4 py-2 border border-gray-300 rounded-lg" maxLength={15} />
          <input type="text" placeholder="State (Auto-detected)" value={formData.businessState} readOnly className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
          Client Details
          {savedClients.length > 0 && (
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3" /> Saved: {savedClients.length}
            </span>
          )}
        </h3>
        
        {savedClients.length > 0 && (
          <div className="mb-4">
            <select 
              onChange={(e) => handleClientSelect(e.target.value)} 
              className="w-full px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>⚡ Select a saved client to auto-fill...</option>
              {savedClients.map(client => (
                <option key={client.id} value={client.id}>{client.name} {client.gstin ? `(${client.gstin})` : ''}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Client Name *" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Client GSTIN (Auto-detects State)" value={formData.clientGSTIN} onChange={(e) => setFormData({...formData, clientGSTIN: e.target.value.toUpperCase()})} className="px-4 py-2 border border-gray-300 rounded-lg" maxLength={15} />
          <input type="text" placeholder="Client Address" value={formData.clientAddress} onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2" />
          {!isExport && (
            <select value={formData.clientState} onChange={(e) => setFormData({...formData, clientState: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg md:col-span-2">
              <option value="">Select Client State</option>
              {Object.values(stateCodes).map(state => (<option key={state} value={state}>{state}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Traditional Template Extra Fields */}
      {templateStyle === 'traditional' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800 mb-3">Traditional Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Delivery Note" value={formData.deliveryNote} onChange={(e) => setFormData({...formData, deliveryNote: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Buyer's Order No." value={formData.buyersOrderNo} onChange={(e) => setFormData({...formData, buyersOrderNo: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Despatch Doc No." value={formData.despatchDocNo} onChange={(e) => setFormData({...formData, despatchDocNo: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Terms of Delivery" value={formData.termsOfDelivery} onChange={(e) => setFormData({...formData, termsOfDelivery: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input type="text" placeholder="Invoice Number" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10" />
            <button 
              onClick={() => setFormData({...formData, invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`})}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1"
              title="Generate new random number"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <input type="date" placeholder="Invoice Date" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Items/Services</h3>
        <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-2 text-xs font-semibold text-gray-500">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">HSN/SAC</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Rate ({totals.currency})</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-center">
            <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="HSN/SAC" value={item.hsn} onChange={(e) => updateItem(index, 'hsn', e.target.value)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg" min="1" />
            <input type="number" placeholder="Rate" value={item.rate || ''} onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg" min="0" />
            <div className="col-span-1 px-3 py-2 bg-gray-50 rounded-lg text-right font-semibold text-sm">{totals.currency}{item.amount.toFixed(2)}</div>
            <button onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700 font-bold" disabled={items.length === 1}>×</button>
          </div>
        ))}
        <button onClick={addItem} className="text-blue-600 hover:text-blue-700 font-medium text-sm">+ Add Item</button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">{totals.currency}{totals.subtotal.toFixed(2)}</span></div>
        {!isExport && (
          <>
            {isInterState ? (
              <div className="flex justify-between mb-2"><span className="text-gray-600">IGST (18%):</span><span className="font-semibold">{totals.currency}{totals.igst.toFixed(2)}</span></div>
            ) : (
              <>
                <div className="flex justify-between mb-2"><span className="text-gray-600">CGST (9%):</span><span className="font-semibold">{totals.currency}{totals.cgst.toFixed(2)}</span></div>
                <div className="flex justify-between mb-2"><span className="text-gray-600">SGST (9%):</span><span className="font-semibold">{totals.currency}{totals.sgst.toFixed(2)}</span></div>
              </>
            )}
          </>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Apply TDS Deduction:</span>
            <select value={tdsRate} onChange={(e) => setTdsRate(parseFloat(e.target.value))} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option value={0}>None</option>
              <option value={2}>2% (Contractor)</option>
              <option value={10}>10% (Professional)</option>
            </select>
          </div>
          {totals.tds > 0 && (
            <div className="flex justify-between mb-2 text-orange-600">
              <span>TDS ({tdsRate}%):</span>
              <span className="font-semibold">- {totals.currency}{totals.tds.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span><span className="text-blue-600">{totals.currency}{totals.total.toFixed(2)}</span></div>
        {totals.tds > 0 && (
          <div className="flex justify-between text-lg font-bold text-green-600 mt-1">
            <span>Amount Payable (after TDS):</span>
            <span>{totals.currency}{totals.amountPayable.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <button onClick={handleDownload} disabled={!formData.businessName || !formData.clientName || items.some(i => !i.description)} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
          Download {templateStyle === 'traditional' ? 'Traditional' : 'Modern'} Tax Invoice PDF
        </button>
      </div>
    </div>
  );
}
