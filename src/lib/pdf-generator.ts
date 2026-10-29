import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './number-to-words';

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
  businessPAN?: string;
  businessPhone?: string;
  businessEmail?: string;
  clientName: string;
  clientAddress: string;
  clientGSTIN: string;
  clientState: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
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
  businessLogo?: string;
  brandColor?: string;
  placeOfSupply?: string;
  reverseCharge?: string;
  // Traditional Template Fields
  deliveryNote?: string;
  buyersOrderNo?: string;
  despatchDocNo?: string;
  termsOfDelivery?: string;
  templateStyle?: 'modern' | 'traditional';
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [37, 99, 235];
};

// --- MODERN TEMPLATE (Existing) ---
export const downloadPDF = (data: InvoiceData) => {
  if (data.templateStyle === 'traditional') {
    return downloadTraditionalPDF(data);
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const [r, g, b] = hexToRgb(data.brandColor || '#2563eb');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 15;

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, 200, 287);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.rect(8, 8, 194, 281);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('TAX INVOICE', pageWidth / 2, yPos + 5, { align: 'center' });
  yPos += 12;

  if (data.businessLogo) {
    try { doc.addImage(data.businessLogo, 'PNG', margin, yPos, 25, 25); } catch (e) {}
  }

  const bizX = data.businessLogo ? margin + 30 : margin;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.businessName || 'Your Business Name', bizX, yPos + 5);
  
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  let infoY = yPos + 10;
  if (data.businessAddress) { doc.text(data.businessAddress, bizX, infoY); infoY += 4; }
  if (data.businessPhone) { doc.text(`Phone: ${data.businessPhone}`, bizX, infoY); infoY += 4; }
  if (data.businessEmail) { doc.text(`Email: ${data.businessEmail}`, bizX, infoY); infoY += 4; }
  if (data.businessGSTIN) { doc.text(`GSTIN: ${data.businessGSTIN}`, bizX, infoY); infoY += 4; }
  if (data.businessPAN) { doc.text(`PAN: ${data.businessPAN}`, bizX, infoY); infoY += 4; }
  if (data.businessState) { doc.text(`State: ${data.businessState}`, bizX, infoY); }

  const boxX = pageWidth - margin - 70;
  doc.setDrawColor(r, g, b);
  doc.setFillColor(r, g, b);
  doc.rect(boxX, yPos - 2, 70, 4, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE DETAILS', boxX + 35, yPos + 1, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  let detailY = yPos + 8;
  doc.setFont('helvetica', 'bold'); doc.text('Invoice No:', boxX + 2, detailY);
  doc.setFont('helvetica', 'normal'); doc.text(data.invoiceNumber || '-', boxX + 35, detailY); detailY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Date:', boxX + 2, detailY);
  doc.setFont('helvetica', 'normal'); doc.text(data.invoiceDate || '-', boxX + 35, detailY); detailY += 4;
  if (data.dueDate) { doc.setFont('helvetica', 'bold'); doc.text('Due Date:', boxX + 2, detailY); doc.setFont('helvetica', 'normal'); doc.text(data.dueDate, boxX + 35, detailY); detailY += 4; }
  doc.setFont('helvetica', 'bold'); doc.text('Place of Supply:', boxX + 2, detailY); doc.setFont('helvetica', 'normal'); doc.text(data.placeOfSupply || data.businessState || '-', boxX + 35, detailY); detailY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Reverse Charge:', boxX + 2, detailY); doc.setFont('helvetica', 'normal'); doc.text(data.reverseCharge || 'No', boxX + 35, detailY);

  yPos = Math.max(yPos + 30, detailY + 5);

  doc.setDrawColor(r, g, b);
  doc.setFillColor(r, g, b);
  doc.rect(margin, yPos, contentWidth, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO (CLIENT DETAILS)', margin + 3, yPos + 3);
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(data.clientName || 'Client Name', margin, yPos);
  yPos += 5;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  if (data.clientAddress) { doc.text(data.clientAddress, margin, yPos); yPos += 4; }
  if (data.clientGSTIN) { doc.text(`GSTIN: ${data.clientGSTIN}`, margin, yPos); yPos += 4; }
  if (data.clientState) { doc.text(`State: ${data.clientState}`, margin, yPos); yPos += 4; }

  yPos += 3;

  const tableColumn = ['S.No', 'Description', 'HSN/SAC', 'Qty', `Rate (${data.currency})`, `Amount (${data.currency})`];
  const tableRows = data.items.map((item, idx) => [
    (idx + 1).toString(), item.description || '-', item.hsn || '-', item.quantity.toString(), item.rate.toFixed(2), item.amount.toFixed(2)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [r, g, b], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
    columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { cellWidth: 70 }, 2: { halign: 'center', cellWidth: 22 }, 3: { halign: 'center', cellWidth: 15 }, 4: { halign: 'right', cellWidth: 28 }, 5: { halign: 'right', cellWidth: 30 } },
    styles: { cellPadding: 2, lineWidth: 0.1, lineColor: [180, 180, 180] },
  });

  let finalY = doc.lastAutoTable.finalY + 5;
  const rightX = pageWidth - margin;
  const labelX = rightX - 55;

  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.rect(labelX - 5, finalY - 3, 60, 35, 'F');

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Taxable Amount:', labelX, finalY + 1); doc.text(`${data.currency}${data.subtotal.toFixed(2)}`, rightX, finalY + 1, { align: 'right' }); finalY += 5;

  if (!data.isExport) {
    if (data.igst > 0) { doc.text(`IGST (18%):`, labelX, finalY + 1); doc.text(`${data.currency}${data.igst.toFixed(2)}`, rightX, finalY + 1, { align: 'right' }); finalY += 5; } 
    else if (data.cgst > 0 || data.sgst > 0) { doc.text(`CGST (9%):`, labelX, finalY + 1); doc.text(`${data.currency}${data.cgst.toFixed(2)}`, rightX, finalY + 1, { align: 'right' }); finalY += 5; doc.text(`SGST (9%):`, labelX, finalY + 1); doc.text(`${data.currency}${data.sgst.toFixed(2)}`, rightX, finalY + 1, { align: 'right' }); finalY += 5; }
  }

  if (data.tds > 0) { doc.setTextColor(220, 38, 38); doc.text(`TDS (${data.tdsRate}%):`, labelX, finalY + 1); doc.text(`- ${data.currency}${data.tds.toFixed(2)}`, rightX, finalY + 1, { align: 'right' }); doc.setTextColor(0, 0, 0); finalY += 5; }

  doc.setFillColor(r, g, b);
  doc.rect(labelX - 5, finalY, 60, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', labelX, finalY + 5);
  doc.text(`${data.currency}${data.total.toFixed(2)}`, rightX, finalY + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  finalY += 12;

  if (data.tds > 0) {
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Amount Payable:', labelX, finalY);
    doc.text(`${data.currency}${data.amountPayable.toFixed(2)}`, rightX, finalY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    finalY += 8;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', margin, finalY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  const amountWords = numberToWords(data.total);
  const splitWords = doc.splitTextToSize(amountWords, contentWidth - 40);
  doc.text(splitWords, margin + 35, finalY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  finalY += splitWords.length * 4 + 5;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(rightX - 50, finalY + 15, rightX, finalY + 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + (data.businessName || 'Business'), rightX - 50, finalY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', rightX - 50, finalY + 20);

  finalY += 30;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('Terms & Conditions:', margin, finalY);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  const terms = ['1. Payment is due within 15 days from the invoice date.', '2. Interest @18% p.a. will be charged on delayed payments.', '3. Subject to local jurisdiction only.', '4. This is a computer-generated invoice.'];
  terms.forEach((term, i) => { doc.text(term, margin, finalY + 4 + (i * 3.5)); });

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated invoice and does not require a physical signature.', pageWidth / 2, 285, { align: 'center' });
  doc.text('Generated by ZapBill | zapbill.vercel.app', pageWidth / 2, 289, { align: 'center' });

  doc.save(`Tax_Invoice_${data.invoiceNumber}.pdf`);
};

// --- TRADITIONAL TEMPLATE (New) ---
export const downloadTraditionalPDF = (data: InvoiceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const [r, g, b] = hexToRgb(data.brandColor || '#000000'); // Traditional often uses black, but we use brand color
  const margin = 10;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 10;

  // Outer Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth / 2, yPos + 5, { align: 'center' });
  yPos += 10;

  // Top Section: Supplier (Left) & Invoice Meta (Right)
  const leftWidth = 120;
  const rightWidth = 70;
  const rightX = margin + leftWidth;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  
  // Supplier Box
  doc.rect(margin, yPos, leftWidth, 35);
  if (data.businessLogo) {
    try { doc.addImage(data.businessLogo, 'PNG', margin + 2, yPos + 2, 15, 15); } catch (e) {}
  }
  const bizTextX = data.businessLogo ? margin + 20 : margin + 2;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.businessName || 'Your Business Name', bizTextX, yPos + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let bizY = yPos + 10;
  if (data.businessAddress) { doc.text(data.businessAddress, bizTextX, bizY); bizY += 4; }
  if (data.businessGSTIN) { doc.text(`GSTIN/UIN: ${data.businessGSTIN}`, bizTextX, bizY); bizY += 4; }
  if (data.businessState) { doc.text(`State Name: ${data.businessState}`, bizTextX, bizY); bizY += 4; }
  if (data.businessEmail) { doc.text(`E-Mail: ${data.businessEmail}`, bizTextX, bizY); }

  // Invoice Meta Box
  doc.rect(rightX, yPos, rightWidth, 35);
  doc.setFontSize(8);
  let metaY = yPos + 4;
  doc.setFont('helvetica', 'bold'); doc.text('Invoice No.', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text(data.invoiceNumber || '-', rightX + 25, metaY); metaY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Dated', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text(data.invoiceDate || '-', rightX + 25, metaY); metaY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Delivery Note', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text(data.deliveryNote || '-', rightX + 25, metaY); metaY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Mode/Terms of Pay', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text('IMME', rightX + 25, metaY); metaY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Supplier Ref.', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, metaY); metaY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Other Reference', margin + 2, metaY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, metaY);

  yPos += 35;

  // Buyer Section
  doc.rect(margin, yPos, leftWidth, 30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Buyer', margin + 2, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.clientName || 'Client Name', margin + 2, yPos + 10);
  doc.setFontSize(8);
  let clientY = yPos + 14;
  if (data.clientAddress) { doc.text(data.clientAddress, margin + 2, clientY); clientY += 4; }
  if (data.clientGSTIN) { doc.text(`GSTIN/UIN: ${data.clientGSTIN}`, margin + 2, clientY); clientY += 4; }
  if (data.clientState) { doc.text(`State Name: ${data.clientState}`, margin + 2, clientY); }

  doc.rect(rightX, yPos, rightWidth, 30);
  doc.setFontSize(8);
  let orderY = yPos + 4;
  doc.setFont('helvetica', 'bold'); doc.text("Buyer's Order No.", margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text(data.buyersOrderNo || '-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Dated', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Despatch Doc No.', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text(data.despatchDocNo || '-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Delivery Note Date', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Despatched through', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Destination', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text('-', rightX + 25, orderY); orderY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Terms of Delivery', margin + 2, orderY); doc.setFont('helvetica', 'normal'); doc.text(data.termsOfDelivery || '-', rightX + 25, orderY);

  yPos += 30;

  // Items Table
  const tableColumn = ['Sl No.', 'Description of Goods', 'HSN/SAC', 'Quantity', 'Rate', 'per', 'Amount'];
  const tableRows = data.items.map((item, idx) => [
    (idx + 1).toString(), 
    item.description || '-', 
    item.hsn || '-', 
    `${item.quantity}`, 
    item.rate.toFixed(2), 
    'PCS', 
    item.amount.toFixed(2)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [r, g, b], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center', lineWidth: 0.2 },
    bodyStyles: { fontSize: 8, textColor: [0, 0, 0], lineWidth: 0.2 },
    columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { cellWidth: 75 }, 2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'center', cellWidth: 20 }, 4: { halign: 'right', cellWidth: 20 }, 5: { halign: 'center', cellWidth: 15 }, 6: { halign: 'right', cellWidth: 28 } },
    styles: { cellPadding: 2, lineColor: [0, 0, 0] },
  });

  let finalY = doc.lastAutoTable.finalY;

  // Total Row in Table
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, finalY, contentWidth, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', margin + 2, finalY + 4);
  doc.text(`${data.items.reduce((s, i) => s + i.quantity, 0)}`, margin + 107, finalY + 4, { align: 'center' });
  doc.text(`${data.currency}${data.subtotal.toFixed(2)}`, pageWidth - margin - 2, finalY + 4, { align: 'right' });
  finalY += 6;

  // Amount in Words
  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, finalY, contentWidth, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Chargeable (in words): E. & O.E', margin + 2, finalY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(data.total), margin + 60, finalY + 4);
  finalY += 10;

  // HSN Summary Table
  const hsnColumn = ['HSN/SAC', 'Taxable Value', 'Central Tax Rate', 'Central Tax Amount', 'State Tax Rate', 'State Tax Amount', 'Total Tax Amount'];
  const hsnRows = data.items.map(item => [
    item.hsn || '-',
    item.amount.toFixed(2),
    '9%',
    (item.amount * 0.09).toFixed(2),
    '9%',
    (item.amount * 0.09).toFixed(2),
    (item.amount * 0.18).toFixed(2)
  ]);

  autoTable(doc, {
    startY: finalY,
    head: [hsnColumn],
    body: hsnRows,
    theme: 'grid',
    headStyles: { fillColor: [r, g, b], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center', lineWidth: 0.2 },
    bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2 },
    columnStyles: { 0: { halign: 'center', cellWidth: 20 }, 1: { halign: 'right', cellWidth: 25 }, 2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 25 }, 4: { halign: 'center', cellWidth: 20 }, 5: { halign: 'right', cellWidth: 25 }, 6: { halign: 'right', cellWidth: 25 } },
    styles: { cellPadding: 1.5, lineColor: [0, 0, 0] },
  });

  finalY = doc.lastAutoTable.finalY + 5;

  // Footer: Declaration & Signatory
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Tax Amount (in words): ' + numberToWords(data.cgst + data.sgst + data.igst), margin, finalY);
  finalY += 4;
  doc.text('Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', margin, finalY, { maxWidth: 120 });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${data.businessName || 'Business'}`, pageWidth - margin - 60, finalY);
  doc.setFont('helvetica', 'normal');
  doc.line(pageWidth - margin - 60, finalY + 10, pageWidth - margin - 10, finalY + 10);
  doc.text('Authorised Signatory', pageWidth - margin - 60, finalY + 14);

  finalY += 20;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a Computer Generated Invoice', pageWidth / 2, 285, { align: 'center' });

  doc.save(`Traditional_Invoice_${data.invoiceNumber}.pdf`);
};
