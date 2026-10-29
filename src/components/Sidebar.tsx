'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, TrendingUp, Archive, LogOut, Loader2, Receipt } from 'lucide-react';

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    window.location.reload();
  };

  const navItems = [
    { name: 'Invoice Generator', href: '/dashboard', icon: FileText },
    { name: 'Cash Flow', href: '/dashboard/cashflow', icon: TrendingUp },
    { name: 'My Invoices', href: '/dashboard/invoices', icon: Archive },
    { name: 'Tax Summary', href: '/dashboard/tax-summary', icon: Receipt },
  ];

  if (loading) return null;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0 hidden md:flex">
      {/* Logo - Clickable to go Home */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <a href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <FileText className="w-6 h-6" />
          <span className="text-gray-900 dark:text-white">ZapBill</span>
        </a>
      </div>

      {/* Navigation */}
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

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs overflow-hidden">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                <p className="text-gray-500 dark:text-gray-400">Pro Plan</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <a href="/auth" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            Login / Sign Up
          </a>
        )}
      </div>
    </aside>
  );
}
