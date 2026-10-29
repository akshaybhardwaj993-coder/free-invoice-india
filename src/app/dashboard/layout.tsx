'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AiAssistant from '@/components/AiAssistant';
import { Menu, X, FileText, Moon, Sun } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Extract name from email (e.g., 'akshay' from 'akshay@gmail.com')
        const name = user.email?.split('@')[0] || 'User';
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none lg:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <a href="/dashboard" className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">ZapBill</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">Hi, {userName}! 👋</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto pt-20 lg:pt-0">
            <Sidebar />
          </div>
        </div>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}
