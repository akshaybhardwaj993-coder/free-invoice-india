import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 11 },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EEE', padding: 8 },
  label: { flex: 1, fontWeight: 'bold' },
  value: { flex: 2 },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 10, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  total: { marginTop: 20, fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 9, color: '#666', textAlign: 'center' }
});

interface InvoiceData {
  businessName: string;
  businessAddress: string;
  businessGSTIN: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
}

const InvoiceDocument = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>TAX INVOICE</Text>
      
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
            <Text style={styles.value}>{data.businessGSTIN}</Text>
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
          <Text style={{ flex: 1, textAlign: 'center' }}>Qty</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>Rate (₹)</Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>Amount (₹)</Text>
        </View>
        {data.items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={{ flex: 3 }}>{item.description}</Text>
            <Text style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>{item.rate.toFixed(2)}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>{item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>₹{data.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CGST (9%):</Text>
          <Text style={styles.value}>₹{data.cgst.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SGST (9%):</Text>
          <Text style={styles.value}>₹{data.sgst.toFixed(2)}</Text>
        </View>
        <Text style={styles.total}>Total: ₹{data.total.toFixed(2)}</Text>
      </View>

      <Text style={styles.footer}>
        Generated free via free-invoice-india.vercel.app | This is a computer-generated invoice
      </Text>
    </Page>
  </Document>
);

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