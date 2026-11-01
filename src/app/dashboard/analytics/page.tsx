'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyData: [] as any[],
    categoryData: [] as any[]
  });
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_date, invoice_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const { data: cashflow } = await supabase
        .from('cashflow')
        .select('type, amount, description, transaction_date, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + (inv.invoice_data?.total || 0), 0) || 0;
      const incomeFromCashflow = cashflow?.filter((c: any) => c.type === 'income').reduce((sum: number, c: any) => sum + c.amount, 0) || 0;
      const totalExpenses = cashflow?.filter((c: any) => c.type === 'expense').reduce((sum: number, c: any) => sum + c.amount, 0) || 0;
      const netProfit = (totalRevenue + incomeFromCashflow) - totalExpenses;
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

      const monthlyData = prepareMonthlyData(invoices, cashflow);
      const categoryData = prepareCategoryData(cashflow);

      setStats({ totalRevenue, totalExpenses, netProfit, profitMargin, monthlyData, categoryData });
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  const prepareMonthlyData = (invoices: any[], cashflow: any[]) => {
    const months: any = {};
    invoices?.forEach((inv: any) => {
      const month = new Date(inv.invoice_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      months[month] = months[month] || { month, revenue: 0, expenses: 0 };
      months[month].revenue += inv.invoice_data?.total || 0;
    });
    cashflow?.filter((c: any) => c.type === 'expense').forEach((cf: any) => {
      const month = new Date(cf.transaction_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      months[month] = months[month] || { month, revenue: 0, expenses: 0 };
      months[month].expenses += cf.amount;
    });
    return Object.values(months).slice(-6);
  };

  const prepareCategoryData = (cashflow: any[]) => {
    const categories: any = {};
    cashflow?.filter((c: any) => c.type === 'expense').forEach((cf: any) => {
      const category = cf.description.split(' ')[0] || 'Other';
      categories[category] = (categories[category] || 0) + cf.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  if (loading) return <div className="p-10 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(stats.netProfit).toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {stats.netProfit >= 0 ? <TrendingUp className="w-6 h-6 text-green-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className={`text-2xl font-bold ${stats.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitMargin.toFixed(1)}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.profitMargin >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {stats.profitMargin >= 0 ? <ArrowUpRight className="w-6 h-6 text-green-600" /> : <ArrowDownRight className="w-6 h-6 text-red-600" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue vs Expenses (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {stats.categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
