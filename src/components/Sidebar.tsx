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
    router.refresh();
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Invoice Generator', href: '/dashboard', icon: FileText },
    { name: 'Cash Flow', href: '/dashboard/cashflow', icon: TrendingUp },
    { name: 'My Invoices', href: '/dashboard/invoices', icon: Archive },
    { name: 'Tax Summary', href: '/dashboard/tax-summary', icon: Receipt },
  ];

  if (loading) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          ZapBill
        </h1>
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
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-medium text-gray-900 truncate w-32">{user.email}</p>
                <p className="text-gray-500">Pro Plan</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
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
