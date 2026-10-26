import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdScripts from "@/components/AdScripts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free GST Invoice Generator for Indian Freelancers",
  description: "Generate professional, GST-compliant invoices in seconds. No signup, no data tracking, 100% free.",
  other: {
    monetag: '9ebb184b6a9cdb098ae910bffce98e05',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AdScripts />
      </body>
    </html>
  );
}