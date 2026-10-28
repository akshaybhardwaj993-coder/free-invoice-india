'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, X, FileText, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <a href="/dashboard" className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">ZapBill</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Overlay (Mobile & Desktop) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto pt-20 lg:pt-0">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
