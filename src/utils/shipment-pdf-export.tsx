import type { IShipment } from 'src/types/shipments';

import React from 'react';
import { Svg, pdf, Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

import { fCurrency } from 'src/utils/format-number';

// Register fonts that support Hungarian characters
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

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
    fontFamily: 'Roboto',
    fontSize: 9,
    paddingTop: 25,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 25,
    lineHeight: 1.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottom: '1pt solid #000',
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Roboto',

  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  section: {
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoColumn: {
    flex: 1,
    paddingRight: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: '50%',
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoValue: {
    width: '50%',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingVertical: 3,
    alignItems: 'center',
    minHeight: 18,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000',
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  productCol: { width: '40%', paddingHorizontal: 4 },
  quantityCol: { width: '30%', paddingHorizontal: 4, textAlign: 'center' },
  notesCol: { width: '30%', paddingHorizontal: 4, textAlign: 'left' },
  summaryRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000',
    paddingVertical: 6,
    marginTop: 8,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 7,
  },
});

function renderPage({shipment, itemsSummary}: Props) {
  const totalValue = itemsSummary.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = itemsSummary.reduce((sum, item) => sum + item.totalQuantity, 0);
  return (
    <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
              {/* Simple logo placeholder */}
                <Text style={styles.title}>
                  Szállítási összesítő részletei {shipment.date ? new Date(shipment.date).toLocaleDateString('hu-HU') : 'Nincs megadva'}
                </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Farm2Fork</Text>
            <Text>Szállítási összesítő</Text>
            <Text>Dátum: {new Date().toLocaleDateString('hu-HU')}</Text>
          </View>
        </View>

        

        {/* Shipment Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rendelések száma:</Text>
              <Text style={styles.infoValue}>{shipment.orderCount}</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Termékek:</Text>
              <Text style={styles.infoValue}>{shipment.productCount}</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Összérték:</Text>
              <Text style={styles.infoValue}>{fCurrency(shipment.productAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={styles.productCol}>Termék neve</Text>
          <Text style={styles.quantityCol}>Mennyiség</Text>
          <Text style={styles.notesCol}>Megjegyzés</Text>
        </View>

        {/* Table Rows */}
        {itemsSummary.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.productCol}>
              {item.isBio && (
                <Text style={{ fontSize: 8, color: '#2e7d32', fontWeight: 'bold', fontFamily: 'Roboto' }}>
                  [BIO]{' '}
                </Text>
              )}
              {item.name}
            </Text>
            <Text style={styles.quantityCol}>
              {item.totalQuantity.toLocaleString('hu-HU')}
              {item.unit && ` ${item.unit}`}
            </Text>
            <Text style={styles.notesCol}></Text>
          </View>
        ))}
      </Page>
  );
}
// ----------------------------------------------------------------------

function ShipmentPDF({ shipment, itemsSummary }: Readonly<Props>) {
  

  return (
    <Document>
      {renderPage({shipment, itemsSummary})}
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

// ----------------------------------------------------------------------

type MultiShipmentPDFProps = {
  shipmentsData: Array<{
    shipment: IShipment;
    itemsSummary: ShipmentItemSummary[];
  }>;
};

function MultiShipmentPDF({ shipmentsData }: Readonly<MultiShipmentPDFProps>) {
  return (
    <Document>
      {shipmentsData.map(({ shipment, itemsSummary }, index) => (
        renderPage({shipment, itemsSummary})
      ))}
    </Document>
  );
}

/**
 * Generate PDF for multiple shipments with each shipment on a new page
 */
export async function generateMultiShipmentPDF(shipmentsData: Array<{
  shipment: IShipment;
  itemsSummary: ShipmentItemSummary[];
}>) {
  const blob = await pdf(<MultiShipmentPDF shipmentsData={shipmentsData} />).toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const shipmentIds = shipmentsData.map(s => s.shipment.id).join('-');
  link.download = `szallitasi-osszesitok-${shipmentIds}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}