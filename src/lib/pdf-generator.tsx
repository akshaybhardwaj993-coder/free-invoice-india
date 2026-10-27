import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 11 },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EEE', padding: 8 },
  label: { flex: 1, fontWeight: 'bold' },
  value: { flex: 2 },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 10, fontWeight: 'bold', fontSize: 10 },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', fontSize: 10 },
  total: { marginTop: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 9, color: '#666', textAlign: 'center' },
  exportNote: { marginTop: 10, fontSize: 9, fontStyle: 'italic', color: '#444', textAlign: 'center' }
});

interface InvoiceData {
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
  items: Array<{ description: string; hsn: string; quantity: number; rate: number; amount: number }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  tds: number;
  tdsRate: number;
  total: number;
  amountPayable: number;
  isExport: boolean;
}

const InvoiceDocument = ({ data }: { data: InvoiceData }) => {
  const currency = data.isExport ? '$' : 'Rs.';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{data.isExport ? 'EXPORT INVOICE' : 'TAX INVOICE'}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.value}>{data.businessName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}></Text>
            <Text style={styles.value}>{data.businessAddress}</Text>
          </View>
          {data.businessGSTIN && (
            <View style={styles.row}>
              <Text style={styles.label}>GSTIN:</Text>
              <Text style={styles.value}>{data.businessGSTIN} ({data.businessState})</Text>
            </View>
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.value}>{data.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}></Text>
            <Text style={styles.value}>{data.clientAddress}</Text>
          </View>
          {data.clientGSTIN && (
            <View style={styles.row}>
              <Text style={styles.label}>Client GSTIN:</Text>
              <Text style={styles.value}>{data.clientGSTIN} ({data.clientState})</Text>
            </View>
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice #:</Text>
            <Text style={styles.value}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{data.invoiceDate}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 3 }}>Description</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>HSN/SAC</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>Qty</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>Rate</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>Amount</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={{ flex: 3 }}>{item.description}</Text>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.hsn || '-'}</Text>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{item.rate.toFixed(2)}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>{currency}{data.subtotal.toFixed(2)}</Text>
          </View>
          {!data.isExport && (
            <>
              {data.igst > 0 ? (
                <View style={styles.row}>
                  <Text style={styles.label}>IGST (18%):</Text>
                  <Text style={styles.value}>{currency}{data.igst.toFixed(2)}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>CGST (9%):</Text>
                    <Text style={styles.value}>{currency}{data.cgst.toFixed(2)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>SGST (9%):</Text>
                    <Text style={styles.value}>{currency}{data.sgst.toFixed(2)}</Text>
                  </View>
                </>
              )}
            </>
          )}
          {data.tds > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>TDS ({data.tdsRate}%):</Text>
              <Text style={styles.value}>- {currency}{data.tds.toFixed(2)}</Text>
            </View>
          )}
          <Text style={styles.total}>Total: {currency}{data.total.toFixed(2)}</Text>
          {data.tds > 0 && (
            <Text style={{ ...styles.total, fontSize: 12, color: '#666', marginTop: 5 }}>
              Amount Payable: {currency}{data.amountPayable.toFixed(2)} (after TDS)
            </Text>
          )}
        </View>
        {data.isExport && (
          <Text style={styles.exportNote}>
            SUPPLY MEANT FOR EXPORT UNDER LETTER OF UNDERTAKING (LUT) WITHOUT PAYMENT OF INTEGRATED TAX
          </Text>
        )}
        <Text style={styles.footer}>Generated free via free-invoice-india.vercel.app</Text>
      </Page>
    </Document>
  );
};

export async function downloadPDF(data: InvoiceData) {
  const blob = await pdf(<InvoiceDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${data.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export type { InvoiceData };
