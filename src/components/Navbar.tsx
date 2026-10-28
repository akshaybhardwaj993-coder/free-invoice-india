'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in when page loads
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for login/logout changes in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-blue-600">Free Invoice India</a>
        
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden md:block">Invoice</a>
          <a href="/cashflow" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden md:block">Cash Flow</a>
          <a href="/invoices" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden md:block">My Invoices</a>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <a href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Login / Sign Up
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
