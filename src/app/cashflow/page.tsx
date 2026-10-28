'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function CashFlow() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('in');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      supabase.from('cashflow').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (error) console.error("Fetch error:", error);
        if (data) setTransactions(data);
      });
    } else {
      const saved = localStorage.getItem('cashflow_data');
      if (saved) {
        const data = JSON.parse(saved);
        setTransactions(data.transactions || []);
        setOpeningBalance(data.openingBalance || 0);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user && !authLoading) {
      localStorage.setItem('cashflow_data', JSON.stringify({ openingBalance, transactions }));
    }
  }, [openingBalance, transactions, user, authLoading]);

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const amountNum = parseFloat(amount);
    const dateStr = new Date().toLocaleDateString('en-IN');

    const newTx = {
      id: user ? crypto.randomUUID() : Date.now(),
      type,
      description: desc,
      amount: amountNum,
      transaction_date: dateStr,
      date: dateStr
    };
    
    setTransactions([newTx, ...transactions]);
    setDesc('');
    setAmount('');

    if (user) {
      // FIX: Added user_id: user.id so the database accepts the row!
      const { error } = await supabase.from('cashflow').insert([{
        type, description: desc, amount: amountNum, transaction_date: dateStr, user_id: user.id
      }]);
      
      if (error) {
        console.error("Database save failed:", error);
        alert("Failed to save to cloud. Please check console.");
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));

    if (user) {
      await supabase.from('cashflow').delete().eq('id', id);
    }
  };

  const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const closingBalance = openingBalance + totalIn - totalOut;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Cash Flow Tracker</h1>
        {user ? (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">☁️ Cloud Synced</span>
        ) : (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">💾 Saved Locally</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Opening Balance</p>
          <input type="number" value={openingBalance || ''} onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)} className="w-full text-2xl font-bold text-gray-900 outline-none border-b border-transparent focus:border-blue-500" placeholder="0" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total In</p>
          <p className="text-2xl font-bold text-green-600">₹{totalIn.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Out</p>
          <p className="text-2xl font-bold text-red-600">₹{totalOut.toFixed(2)}</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-xl shadow-sm text-white">
          <p className="text-sm text-blue-100 mb-1">Closing Balance</p>
          <p className="text-2xl font-bold">₹{closingBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
        <form onSubmit={addTransaction} className="flex flex-col md:flex-row gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="in">Cash In (+)</option>
            <option value="out">Cash Out (-)</option>
          </select>
          <input type="text" placeholder="Description (e.g., Client Payment)" value={desc} onChange={(e) => setDesc(e.target.value)} className="flex-grow px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg" required />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Add</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Recent Transactions</div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No transactions yet. Add one above!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.transaction_date || t.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'in' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)}
                  </span>
                  <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-500 text-xl">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
