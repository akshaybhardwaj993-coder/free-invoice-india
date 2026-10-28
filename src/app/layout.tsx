import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ZapBill | Free GST Invoice Generator & Cash Flow Tracker',
  description: 'ZapBill helps Indian freelancers generate GST-compliant invoices, track daily cash flow, and manage business finances. 100% free, private, and cloud-synced.',
     openGraph: {
     title: 'ZapBill - The Fastest Invoice Generator for India',
     description: 'Generate professional GST invoices and track cash flow in seconds. No signup required.',
     url: 'https://zapbill.vercel.app', // <--- UPDATE THIS LINE!
     siteName: 'ZapBill',
     locale: 'en_IN',
     type: 'website',
   },