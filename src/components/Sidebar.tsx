'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { FileText, TrendingUp, Archive, Receipt, Users } from 'lucide-react';

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const navItems = [
    { name: 'Invoice Generator', href: '/dashboard', icon: FileText },
    { name: 'Cash Flow', href: '/dashboard/cashflow', icon: TrendingUp },
    { name: 'My Invoices', href: '/dashboard/invoices', icon: Archive },
    { name: 'Tax Summary', href: '/dashboard/tax-summary', icon: Receipt },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
  ];

  if (loading) return null;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0 hidden md:flex">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <a href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <FileText className="w-6 h-6" />
          <span className="text-gray-900 dark:text-white">ZapBill</span>
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* User Profile Only (No Logout here anymore) */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs overflow-hidden">
              <p className="font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
              <p className="text-gray-500 dark:text-gray-400">Pro Plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
