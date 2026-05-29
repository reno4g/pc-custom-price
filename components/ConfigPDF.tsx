import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PriceLineItem } from '@/actions/price'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666', marginBottom: 24 },
  table: { width: '100%' },
  headerRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderColor: '#e5e7eb', padding: '8 4' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7eb', padding: '6 4' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1.5, textAlign: 'right' },
  col4: { flex: 1.5, textAlign: 'right' },
  totalRow: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: '8 4', marginTop: 2 },
  totalLabel: { flex: 6, textAlign: 'right', fontWeight: 'bold' },
  totalValue: { flex: 1.5, textAlign: 'right', fontWeight: 'bold', fontSize: 13 },
  headerText: { fontWeight: 'bold', fontSize: 10, color: '#374151' },
})

type Props = {
  configName: string
  lineItems: PriceLineItem[]
  total: number
}

export function ConfigPDF({ configName, lineItems, total }: Props) {
  const date = new Date().toLocaleDateString('ja-JP')
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{configName}</Text>
        <Text style={styles.subtitle}>発行日: {date}</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.col1, styles.headerText]}>パーツ名</Text>
            <Text style={[styles.col2, styles.headerText]}>数量</Text>
            <Text style={[styles.col3, styles.headerText]}>単価</Text>
            <Text style={[styles.col4, styles.headerText]}>小計</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.col1}>{item.part_name}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>¥{item.unit_price.toLocaleString('ja-JP')}</Text>
              <Text style={styles.col4}>¥{item.subtotal.toLocaleString('ja-JP')}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>合計卸値</Text>
            <Text style={styles.totalValue}>¥{total.toLocaleString('ja-JP')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
