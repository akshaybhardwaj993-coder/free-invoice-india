'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit3, Trash2, X, Save, Building2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', gstin: '', address: '', state: '', email: '', phone: '' });
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth'); return; }

    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const openModal = (client?: any) => {
    if (client) {
      setEditId(client.id);
      setForm({ name: client.name, gstin: client.gstin || '', address: client.address || '', state: client.state || '', email: client.email || '', phone: client.phone || '' });
    } else {
      setEditId(null);
      setForm({ name: '', gstin: '', address: '', state: '', email: '', phone: '' });
    }
    setShowModal(true);
  };

  const saveClient = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!form.name) return alert('Client name is required');

    if (editId) {
      await supabase.from('clients').update(form).eq('id', editId);
    } else {
      await supabase.from('clients').insert([{ ...form, user_id: user?.id }]);
    }
    setShowModal(false);
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  };

  if (loading) return <div className="p-10">Loading clients...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Client Directory
          </h1>
          <p className="text-gray-500 mt-1">Save your clients to auto-fill invoices instantly.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No clients saved yet. Click "Add Client" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(client)} className="text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteClient(client.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{client.name}</h3>
              {client.gstin && <p className="text-xs text-gray-500 font-mono mb-2">GSTIN: {client.gstin}</p>}
              {client.email && <p className="text-sm text-gray-600 truncate">{client.email}</p>}
              {client.state && <p className="text-sm text-gray-500 mt-1">{client.state}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Client Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">GSTIN</label>
                  <input type="text" value={form.gstin} onChange={(e) => setForm({...form, gstin: e.target.value.toUpperCase()})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" maxLength={15} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">State</label>
                  <input type="text" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={saveClient} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
