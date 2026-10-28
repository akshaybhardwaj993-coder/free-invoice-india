'use client';
import { useState, useEffect } from 'react';

export default function CashFlow() {
  const [openingBalance, setOpeningBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('in');

  useEffect(() => {
    const saved = localStorage.getItem('cashflow_data');
    if (saved) {
      const data = JSON.parse(saved);
      setOpeningBalance(data.openingBalance || 0);
      setTransactions(data.transactions || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cashflow_data', JSON.stringify({ openingBalance, transactions }));
  }, [openingBalance, transactions]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const newTx = { 
      id: Date.now(), 
      type, 
      description: desc, 
      amount: parseFloat(amount), 
      date: new Date().toLocaleDateString('en-IN') 
    };
    setTransactions([newTx, ...transactions]);
    setDesc('');
    setAmount('');
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const closingBalance = openingBalance + totalIn - totalOut;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Daily Cash Flow Tracker</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Opening Balance</p>
          <input
            type="number"
            value={openingBalance || ''}
            onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
            className="w-full text-2xl font-bold text-gray-900 outline-none border-b border-transparent focus:border-blue-500"
            placeholder="0"
          />
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

      {/* Add Transaction Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
        <form onSubmit={addTransaction} className="flex flex-col md:flex-row gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="in">Cash In (+)</option>
            <option value="out">Cash Out (-)</option>
          </select>
          <input type="text" placeholder="Description (e.g., Client Payment, Rent)" value={desc} onChange={(e) => setDesc(e.target.value)} className="flex-grow px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg" required />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Add</button>
        </form>
      </div>

      {/* Transaction List */}
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
                  <p className="text-xs text-gray-500">{t.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'in' ? '+' : '-'}₹{t.amount.toFixed(2)}
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
