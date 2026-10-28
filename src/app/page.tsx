'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { FileText, TrendingUp, Cloud, Shield, Zap, CheckCircle, Sun, Moon } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ZapBill</span>
            </div>
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              ) : user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">Hi, {user.email?.split('@')[0]}! 👋</span>
                  <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
                  <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Built for Indian Freelancers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Invoicing & Cash Flow,<br />
            <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Generate GST-compliant invoices in seconds, track your daily cash flow with visual charts, and sync everything to the cloud. 100% free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-200">
              {user ? 'Go to Dashboard &rarr;' : 'Start Billing Now &rarr;'}
            </Link>
            <Link href="#features" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
              See Features
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to get paid</h2>
            <p className="text-xl text-gray-600">Professional tools without the professional price tag.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">GST-Compliant Invoices</h3>
              <p className="text-gray-600">Auto-detects state from GSTIN, calculates CGST/SGST/IGST, and handles TDS deductions automatically.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Cash Flow</h3>
              <p className="text-gray-600">Track daily income and expenses with beautiful charts. Know exactly where your money is going.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cloud Synced</h3>
              <p className="text-gray-600">Log in to save your invoice history and access your financial data from any device, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Why freelancers love ZapBill</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {['Auto GSTIN State Detection', 'TDS & Export Invoice Support', 'Download PDF Instantly', 'Save Invoice History', 'Visual Cash Flow Charts', '100% Private & Secure'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-lg text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to streamline your finances?</h2>
          <p className="text-xl text-blue-100 mb-10">Join thousands of Indian freelancers using ZapBill to get paid faster.</p>
          <Link href="/dashboard" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg inline-block">
            {user ? 'Go to Dashboard &rarr;' : 'Get Started Free &rarr;'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" />
            <span className="text-white font-bold">ZapBill</span>
          </div>
          <p className="text-sm">© 2026 ZapBill. Made with ❤️ for Indian Freelancers.</p>
          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="mailto:support@zapbill.vercel.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
