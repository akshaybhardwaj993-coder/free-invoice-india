'use client';
import { useState } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { parseCommand } from '@/lib/command-parser';

type Message = { id: number; text: string; sender: 'user' | 'bot'; isError?: boolean };

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm ZapBot. Try saying: 'Paid 500 to John for hosting' or 'Invoiced ABC Corp 2000'", sender: 'bot' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const command = parseCommand(userMsg.text);
    let botResponse = "";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      if (command.type === 'unknown') {
        botResponse = "I didn't understand that. Try 'Paid [amount] to [name]' or 'Invoiced [name] [amount]'.";
      } else if (command.type === 'expense' || command.type === 'income') {
        // Update Cashflow - FIXED: changed 'date' to 'created_at'
        const { error } = await supabase.from('cashflow').insert([{
          user_id: user.id,
          type: command.type,
          amount: command.amount,
          description: `${command.description} (${command.client})`,
          created_at: new Date().toISOString() 
        }]);

        if (error) throw error;
        botResponse = `✅ Done! Added ${command.type === 'expense' ? 'Expense' : 'Income'} of ${command.amount} for ${command.client}.`;
      } else if (command.type === 'invoice') {
        // Create Simple Invoice
        const invNum = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
        const { error } = await supabase.from('invoices').insert([{
          user_id: user.id,
          invoice_number: invNum,
          client_name: command.client,
          invoice_date: new Date().toISOString().split('T')[0],
          invoice_data: {
            subtotal: command.amount,
            total: command.amount,
            items: [{ description: command.description, amount: command.amount, quantity: 1, rate: command.amount }]
          }
        }]);

        if (error) throw error;
        botResponse = `🧾 Invoice Created! Sent invoice #${invNum} to ${command.client} for ${command.amount}.`;
      }
    } catch (err: any) {
      botResponse = `❌ Error: ${err.message || 'Something went wrong.'}`;
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden h-[500px]">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><Bot className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold">ZapBot Assistant</h3>
              <p className="text-xs text-blue-100">Automate your finances</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a command..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
