import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface InvoiceItem {
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  businessName: string;
  businessAddress: string;
  businessGSTIN: string;
  businessState: string;
  clientName: string;
  clientAddress: string;
  clientGSTIN: string;
  clientState: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  tds: number;
  tdsRate: number;
  amountPayable: number;
  total: number;
  currency: string;
  isExport: boolean;
  businessLogo?: string; // Base64 image string
  brandColor?: string;   // Hex color string
}

// Helper to convert hex to RGB for jsPDF
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [37, 99, 235]; // Default blue
};

export const downloadPDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const [r, g, b] = hexToRgb(data.brandColor || '#2563eb');
  const currency = data.currency;

  // 1. Header & Logo
  let yPos = 20;
  if (data.businessLogo) {
    try {
      doc.addImage(data.businessLogo, 'PNG', 14, yPos, 30, 30);
      yPos = 55;
    } catch (e) {
      // Ignore invalid image errors
    }
  }

  // Business Details (Right aligned if logo exists, else left)
  const bizX = data.businessLogo ? 50 : 14;
  doc.setFontSize(18);
  doc.setTextColor(r, g, b);
  doc.text(data.businessName || 'Your Business', bizX, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (data.businessAddress) doc.text(data.businessAddress, bizX, yPos + 7);
  if (data.businessGSTIN) doc.text(`GSTIN: ${data.businessGSTIN}`, bizX, yPos + 13);
  if (data.businessState) doc.text(`State: ${data.businessState}`, bizX, yPos + 19);

  // Invoice Details (Top Right)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 196, 20, { align: 'right' });
  doc.text(`Date: ${data.invoiceDate}`, 196, 26, { align: 'right' });

  // Divider Line
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(14, 60, 196, 60);

  // 2. Client Details
  doc.setFontSize(12);
  doc.setTextColor(r, g, b);
  doc.text('Bill To:', 14, 75);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(data.clientName || 'Client Name', 14, 82);
  if (data.clientAddress) doc.text(data.clientAddress, 14, 88);
  if (data.clientGSTIN) doc.text(`GSTIN: ${data.clientGSTIN}`, 14, 94);
  if (data.clientState) doc.text(`State: ${data.clientState}`, 14, 100);

  // 3. Items Table
  const tableColumn = ['Description', 'HSN/SAC', 'Qty', `Rate (${currency})`, `Amount (${currency})`];
  const tableRows = data.items.map(item => [
    item.description,
    item.hsn,
    item.quantity.toString(),
    item.rate.toFixed(2),
    item.amount.toFixed(2)
  ]);

  doc.autoTable({
    startY: 110,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [r, g, b], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // 4. Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const rightX = 196;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  doc.text(`Subtotal:`, rightX - 40, finalY, { align: 'right' });
  doc.text(`${currency}${data.subtotal.toFixed(2)}`, rightX, finalY, { align: 'right' });

  let currentY = finalY + 7;
  if (!data.isExport) {
    if (data.igst > 0) {
      doc.text(`IGST (18%):`, rightX - 40, currentY, { align: 'right' });
      doc.text(`${currency}${data.igst.toFixed(2)}`, rightX, currentY, { align: 'right' });
      currentY += 7;
    } else {
      doc.text(`CGST (9%):`, rightX - 40, currentY, { align: 'right' });
      doc.text(`${currency}${data.cgst.toFixed(2)}`, rightX, currentY, { align: 'right' });
      currentY += 7;
      doc.text(`SGST (9%):`, rightX - 40, currentY, { align: 'right' });
      doc.text(`${currency}${data.sgst.toFixed(2)}`, rightX, currentY, { align: 'right' });
      currentY += 7;
    }
  }

  if (data.tds > 0) {
    doc.text(`TDS (${data.tdsRate}%):`, rightX - 40, currentY, { align: 'right' });
    doc.setTextColor(234, 88, 12); // Orange for TDS
    doc.text(`- ${currency}${data.tds.toFixed(2)}`, rightX, currentY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    currentY += 7;
  }

  // Total Box
  currentY += 5;
  doc.setFillColor(r, g, b);
  doc.rect(rightX - 60, currentY - 5, 60, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Total:`, rightX - 40, currentY + 2, { align: 'right' });
  doc.text(`${currency}${data.total.toFixed(2)}`, rightX, currentY + 2, { align: 'right' });

  if (data.tds > 0) {
    currentY += 10;
    doc.setTextColor(22, 163, 74); // Green for payable
    doc.setFontSize(11);
    doc.text(`Amount Payable:`, rightX - 40, currentY, { align: 'right' });
    doc.text(`${currency}${data.amountPayable.toFixed(2)}`, rightX, currentY, { align: 'right' });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by ZapBill | zapbill.vercel.app', 105, 285, { align: 'center' });

  doc.save(`${data.invoiceNumber}.pdf`);
};
