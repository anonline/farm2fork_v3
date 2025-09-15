import type { IShipment } from 'src/types/shipments';

import React from 'react';
import { Svg, pdf, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type ShipmentItemSummary = {
  id: string;
  name: string;
  size?: string;
  unit?: string;
  totalQuantity: number;
  averagePrice: number;
  totalValue: number;
  orderCount: number;
  customersCount: number;
  customers: string[];
  productId?: string;
  isBio?: boolean;
};

type Props = {
  shipment: IShipment;
  itemsSummary: ShipmentItemSummary[];
};

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 65,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingVertical: 5,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  col1: { width: '25%', paddingHorizontal: 4 },
  col2: { width: '15%', paddingHorizontal: 4, textAlign: 'center' },
  col3: { width: '15%', paddingHorizontal: 4, textAlign: 'right' },
  col4: { width: '15%', paddingHorizontal: 4, textAlign: 'right' },
  col5: { width: '15%', paddingHorizontal: 4, textAlign: 'center' },
  col6: { width: '15%', paddingHorizontal: 4, textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000',
    paddingVertical: 8,
    marginTop: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 8,
  },
});

// ----------------------------------------------------------------------

function ShipmentPDF({ shipment, itemsSummary }: Props) {
  const totalValue = itemsSummary.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = itemsSummary.reduce((sum, item) => sum + item.totalQuantity, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Svg style={styles.logo} viewBox="0 0 100 100">
              {/* Simple logo placeholder */}
              <View style={{ width: 60, height: 60, backgroundColor: '#1976d2', borderRadius: 4 }}>
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', paddingTop: 20 }}>
                  F2F
                </Text>
              </View>
            </Svg>
          </View>
          <View style={styles.companyInfo}>
            <Text>Farm2Fork</Text>
            <Text>Szállítási összesítő</Text>
            <Text>Dátum: {new Date().toLocaleDateString('hu-HU')}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Szállítási összesítő részletei #{shipment.id}
        </Text>

        {/* Shipment Info */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Összesítő információk</Text>
          <View style={styles.row}>
            <Text style={styles.col1}>Szállítási dátum:</Text>
            <Text style={styles.col1}>
              {shipment.date ? new Date(shipment.date).toLocaleDateString('hu-HU') : 'Nincs megadva'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col1}>Rendelések száma:</Text>
            <Text style={styles.col1}>{shipment.orderCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col1}>Termékek száma:</Text>
            <Text style={styles.col1}>{shipment.productCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col1}>Összérték:</Text>
            <Text style={styles.col1}>{fCurrency(shipment.productAmount)}</Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={styles.subtitle}>Termékek összesítése</Text>
        
        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={styles.col1}>Termék</Text>
          <Text style={styles.col2}>Mennyiség</Text>
          <Text style={styles.col3}>Átlag ár</Text>
          <Text style={styles.col4}>Összérték</Text>
          <Text style={styles.col5}>Rendelések</Text>
          <Text style={styles.col6}>Vásárlók</Text>
        </View>

        {/* Table Rows */}
        {itemsSummary.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.col1}>
              {item.name}
              {item.isBio && (
                <Text style={{ fontSize: 8, color: '#2e7d32', fontWeight: 'bold' }}>
                  {' '}[BIO]
                </Text>
              )}
              {(item.size || item.unit) && (
                <Text style={{ fontSize: 8, color: '#666' }}>
                  {' '}({[item.size, item.unit].filter(Boolean).join(' • ')})
                </Text>
              )}
            </Text>
            <Text style={styles.col2}>{item.totalQuantity.toLocaleString('hu-HU')}</Text>
            <Text style={styles.col3}>{fCurrency(item.averagePrice)}</Text>
            <Text style={styles.col4}>{fCurrency(item.totalValue)}</Text>
            <Text style={styles.col5}>{item.orderCount}</Text>
            <Text style={styles.col6}>{item.customersCount}</Text>
          </View>
        ))}

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.col1}>Összesen</Text>
          <Text style={styles.col2}>{totalQuantity.toLocaleString('hu-HU')}</Text>
          <Text style={styles.col3}>-</Text>
          <Text style={styles.col4}>{fCurrency(totalValue)}</Text>
          <Text style={styles.col5}>-</Text>
          <Text style={styles.col6}>-</Text>
        </View>
      </Page>
    </Document>
  );
}

// ----------------------------------------------------------------------

export async function generateShipmentPDF(shipment: IShipment, itemsSummary: ShipmentItemSummary[]) {
  const blob = await pdf(<ShipmentPDF shipment={shipment} itemsSummary={itemsSummary} />).toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `szallitasi-osszesito-${shipment.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}