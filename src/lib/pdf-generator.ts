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
  deliveryNote?: string;
  buyersOrderNo?: string;
  despatchDocNo?: string;
  termsOfDelivery?: string;
  templateStyle?: 'modern' | 'traditional';
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
};

// --- MODERN TEMPLATE ---
export const downloadPDF = (data: InvoiceData) => {
  if (data.templateStyle === 'traditional') {
    return downloadTraditionalPDF(data);
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const [r, g, b] = hexToRgb(data.brandColor || '#2563eb');
  const pageWidth = 210;
  const margin = 15;
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
  doc.rect(margin, yPos, pageWidth - 2 * margin, 4, 'F');
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
  const splitWords = doc.splitTextToSize(amountWords, pageWidth - 2 * margin - 40);
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

// --- TRADITIONAL TEMPLATE (Matches Bhardwaj Motor Co. format exactly) ---
export const downloadTraditionalPDF = (data: InvoiceData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const [r, g, b] = hexToRgb(data.brandColor || '#000000');
  const margin = 8;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  const leftWidth = 115;
  const rightWidth = contentWidth - leftWidth;
  const rightX = margin + leftWidth;
  
  let yPos = 8;

  // Outer Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.rect(5, 5, 200, 287);

  // Header: TAX INVOICE
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth / 2, yPos + 5, { align: 'center' });
  yPos += 10;

  // ===== ROW 1: Supplier (Left) | Invoice Meta (Right) =====
  const row1Height = 32;
  
  // Supplier Box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, leftWidth, row1Height);
  
  // Logo
  if (data.businessLogo) {
    try { doc.addImage(data.businessLogo, 'PNG', margin + 2, yPos + 2, 18, 18); } catch (e) {}
  }
  const bizTextX = data.businessLogo ? margin + 22 : margin + 2;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(data.businessName || 'Your Business Name', bizTextX, yPos + 5);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  let bizY = yPos + 9;
  if (data.businessAddress) { 
    const addrLines = doc.splitTextToSize(data.businessAddress, leftWidth - (data.businessLogo ? 24 : 4));
    doc.text(addrLines, bizTextX, bizY); 
    bizY += addrLines.length * 3; 
  }
  if (data.businessGSTIN) { doc.text(`GSTIN/UIN: ${data.businessGSTIN}`, bizTextX, bizY); bizY += 3; }
  if (data.businessState) { doc.text(`State Name: ${data.businessState}`, bizTextX, bizY); bizY += 3; }
  if (data.businessEmail) { doc.text(`E-Mail: ${data.businessEmail}`, bizTextX, bizY); }

  // Invoice Meta Box
  doc.rect(rightX, yPos, rightWidth, row1Height);
  doc.setFontSize(7);
  const metaRows = [
    { label: 'Invoice No.', value: data.invoiceNumber || '-' },
    { label: 'Dated', value: data.invoiceDate || '-' },
    { label: 'Delivery Note', value: data.deliveryNote || '-' },
    { label: 'Mode/Terms of Payment', value: 'IMME' },
    { label: "Supplier's Ref.", value: '-' },
    { label: 'Other Reference(s)', value: '-' },
  ];
  const metaRowH = row1Height / metaRows.length;
  metaRows.forEach((row, i) => {
    const rowY = yPos + (i * metaRowH) + 3;
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, rightX + 2, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(row.value, rightX + rightWidth / 2, rowY);
  });

  yPos += row1Height;

  // ===== ROW 2: Buyer (Left) | Order Details (Right) =====
  const row2Height = 28;
  
  // Buyer Box
  doc.rect(margin, yPos, leftWidth, row2Height);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Buyer', margin + 2, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.clientName || 'Client Name', margin + 2, yPos + 9);
  doc.setFontSize(7);
  let clientY = yPos + 13;
  if (data.clientAddress) { 
    const cAddrLines = doc.splitTextToSize(data.clientAddress, leftWidth - 4);
    doc.text(cAddrLines, margin + 2, clientY); 
    clientY += cAddrLines.length * 3; 
  }
  if (data.clientGSTIN) { doc.text(`GSTIN/UIN: ${data.clientGSTIN}`, margin + 2, clientY); clientY += 3; }
  if (data.clientState) { doc.text(`State Name: ${data.clientState}`, margin + 2, clientY); }

  // Order Details Box
  doc.rect(rightX, yPos, rightWidth, row2Height);
  doc.setFontSize(7);
  const orderRows = [
    { label: "Buyer's Order No.", value: data.buyersOrderNo || '-' },
    { label: 'Dated', value: '-' },
    { label: 'Despatch Document No.', value: data.despatchDocNo || '-' },
    { label: 'Delivery Note Date', value: '-' },
    { label: 'Despatched through', value: '-' },
    { label: 'Destination', value: '-' },
    { label: 'Terms of Delivery', value: data.termsOfDelivery || 'ON DISPATCH' },
  ];
  const orderRowH = row2Height / orderRows.length;
  orderRows.forEach((row, i) => {
    const rowY = yPos + (i * orderRowH) + 3;
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, rightX + 2, rowY);
    doc.setFont('helvetica', 'normal');
    doc.text(row.value, rightX + rightWidth / 2, rowY);
  });

  yPos += row2Height;

  // ===== ITEMS TABLE =====
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

  // Add total row
  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);
  tableRows.push(['', 'Total', '', `${totalQty}`, '', '', `${data.currency}${data.subtotal.toFixed(2)}`]);

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [r, g, b], 
      textColor: 255, 
      fontSize: 7, 
      fontStyle: 'bold', 
      halign: 'center', 
      lineWidth: 0.2,
      cellPadding: 1.5
    },
    bodyStyles: { 
      fontSize: 7, 
      textColor: [0, 0, 0], 
      lineWidth: 0.2,
      cellPadding: 1.5
    },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 12 }, 
      1: { cellWidth: 78 }, 
      2: { halign: 'center', cellWidth: 18 }, 
      3: { halign: 'center', cellWidth: 18 }, 
      4: { halign: 'right', cellWidth: 18 }, 
      5: { halign: 'center', cellWidth: 12 }, 
      6: { halign: 'right', cellWidth: 24 } 
    },
    styles: { lineColor: [0, 0, 0] },
    didParseCell: function(data: any) {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY;

  // ===== AMOUNT IN WORDS ROW =====
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, finalY, contentWidth, 8);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Chargeable (in words) E. & O.E', margin + 2, finalY + 5);
  doc.setFont('helvetica', 'normal');
  const wordsText = `Indian Rupees ${numberToWords(data.total).replace('Rupees ', '').replace(' Only', '')} only`;
  doc.text(wordsText, margin + 55, finalY + 5);
  finalY += 8;

  // ===== HSN SUMMARY TABLE =====
  const hsnColumn = ['HSN/SAC', 'Taxable Value', 'Central Tax Rate', 'Central Tax Amount', 'State Tax Rate', 'State Tax Amount', 'Total Tax Amount'];
  const hsnRows = data.items.map(item => {
    const cgstAmt = (item.amount * 0.09).toFixed(2);
    const sgstAmt = (item.amount * 0.09).toFixed(2);
    const totalTax = (item.amount * 0.18).toFixed(2);
    return [
      item.hsn || '-',
      item.amount.toFixed(2),
      '9%',
      cgstAmt,
      '9%',
      sgstAmt,
      totalTax
    ];
  });

  // Add total row for HSN table
  const totalTaxable = data.subtotal.toFixed(2);
  const totalCgst = data.cgst.toFixed(2);
  const totalSgst = data.sgst.toFixed(2);
  const totalTaxAmt = (data.cgst + data.sgst).toFixed(2);
  hsnRows.push(['Total', totalTaxable, '', totalCgst, '', totalSgst, totalTaxAmt]);

  autoTable(doc, {
    startY: finalY,
    head: [hsnColumn],
    body: hsnRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [r, g, b], 
      textColor: 255, 
      fontSize: 6, 
      fontStyle: 'bold', 
      halign: 'center', 
      lineWidth: 0.2,
      cellPadding: 1
    },
    bodyStyles: { 
      fontSize: 6, 
      textColor: [0, 0, 0], 
      lineWidth: 0.2,
      cellPadding: 1
    },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 18 }, 
      1: { halign: 'right', cellWidth: 22 }, 
      2: { halign: 'center', cellWidth: 18 }, 
      3: { halign: 'right', cellWidth: 22 }, 
      4: { halign: 'center', cellWidth: 18 }, 
      5: { halign: 'right', cellWidth: 22 }, 
      6: { halign: 'right', cellWidth: 22 } 
    },
    styles: { lineColor: [0, 0, 0] },
    didParseCell: function(data: any) {
      if (data.row.index === hsnRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  finalY = doc.lastAutoTable.finalY + 3;

  // ===== FOOTER: Tax Amount Words + Declaration + Signatory =====
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tax Amount (in words): Indian Rupees ${numberToWords(data.cgst + data.sgst + data.igst).replace('Rupees ', '').replace(' Only', '')} only`, margin, finalY);
  finalY += 4;
  
  doc.text('Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', margin, finalY, { maxWidth: 130 });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${data.businessName || 'Business'}`, pageWidth - margin - 55, finalY);
  doc.setFont('helvetica', 'normal');
  doc.line(pageWidth - margin - 55, finalY + 8, pageWidth - margin - 10, finalY + 8);
  doc.text('Authorised Signatory', pageWidth - margin - 55, finalY + 12);

  finalY += 18;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a Computer Generated Invoice', pageWidth / 2, 288, { align: 'center' });

  doc.save(`Traditional_Invoice_${data.invoiceNumber}.pdf`);
};
