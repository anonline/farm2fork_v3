import type { IShipment } from 'src/types/shipments';

import React, { Fragment } from 'react';
import { pdf, Page, Text, View, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fCurrency } from 'src/utils/format-number';

import { fDate } from './format-time';

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
  isBundleItem?: boolean;
  parentQuantity?: number;
  individualQuantity?: number;
};

type Props = {
  shipment: IShipment;
  itemsSummary: ShipmentItemSummary[];
  categoryOrder?: number[];
  categoryConnections?: Map<string, number[]>;
};

/**
 * Sort shipment items by category order
 * Items with multiple categories will be sorted by the earliest category in the order
 * Items without categories or with unordered categories appear at the end
 */
function sortShipmentItemsByCategoryOrder(
  items: ShipmentItemSummary[],
  categoryOrder: number[],
  categoryConnections: Map<string, number[]>
): ShipmentItemSummary[] {
  console.log('🔍 [sortShipmentItemsByCategoryOrder] Starting bucket sort with:', {
    itemsCount: items.length,
    categoryOrderLength: categoryOrder.length,
    categoryConnectionsSize: categoryConnections.size,
    sampleItems: items.slice(0, 3).map(i => ({ productId: i.productId, name: i.name })),
    categoryConnectionsKeys: Array.from(categoryConnections.keys()).slice(0, 10),
    categoryConnectionsSample: Array.from(categoryConnections.entries()).slice(0, 5).map(([k, v]) => ({ productId: k, categories: v }))
  });

  if (!categoryOrder || categoryOrder.length === 0) {
    console.log('⚠️ [sortShipmentItemsByCategoryOrder] No category order, sorting alphabetically');
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Create buckets for each category in the order (excluding 42 which is special fallback)
  // Key is category ID, value is array of items
  const buckets = new Map<number, ShipmentItemSummary[]>();
  
  // Create a map of category ID to its position in the order (excluding 42)
  const orderMap = new Map<number, number>();
  const filteredCategoryOrder = categoryOrder.filter(id => id !== 42);
  
  // Initialize buckets for all categories in order (except 42)
  filteredCategoryOrder.forEach((catId, index) => {
    buckets.set(catId, []);
    orderMap.set(catId, index);
  });
  
  // Add bucket 42 for "All Products" (uncategorized items) - NOT in orderMap
  buckets.set(42, []);

  console.log('🪣 [sortShipmentItemsByCategoryOrder] Created buckets for categories:', 
    Array.from(buckets.keys()),
    '\n   Category 42 is fallback bucket (not in orderMap)'
  );

  // Place each item in the bucket of its highest position category
  items.forEach(item => {
    // Convert productId to string for Map lookup (handles both string and number types)
    const productIdKey = item.productId ? String(item.productId) : '';
    const itemCategories = categoryConnections.get(productIdKey) || [];
    
    if (itemCategories.length === 0) {
      // No categories, put in bucket 42
      console.log('📦 [sortShipmentItemsByCategoryOrder] Item has no categories, adding to bucket 42:', {
        name: item.name,
        productId: item.productId,
        productIdType: typeof item.productId,
        productIdKey,
        lookupResult: categoryConnections.get(productIdKey),
        hasInMap: categoryConnections.has(productIdKey)
      });
      buckets.get(42)!.push(item);
      return;
    }

    // Find the highest position (most specific) category that exists in our order
    const orderedPositions = itemCategories
      .map(catId => ({ catId, position: orderMap.get(catId) }))
      .filter(({ position }) => position !== undefined)
      .sort((a, b) => b.position! - a.position!); // Sort descending to get highest position

    if (orderedPositions.length === 0) {
      // Item has categories but none are in the order, put in bucket 42
      console.log('📦 [sortShipmentItemsByCategoryOrder] Item categories not in order, adding to bucket 42:', 
        { name: item.name, categories: itemCategories }
      );
      buckets.get(42)!.push(item);
      return;
    }

    // Use the highest position category
    const targetCategory = orderedPositions[0].catId;
    console.log('📦 [sortShipmentItemsByCategoryOrder] Adding item to bucket:', 
      { name: item.name, categories: itemCategories, targetBucket: targetCategory }
    );
    buckets.get(targetCategory)!.push(item);
  });

  // Log bucket sizes
  console.log('� [sortShipmentItemsByCategoryOrder] Bucket sizes:', 
    Array.from(buckets.entries()).map(([catId, items]) => ({ categoryId: catId, count: items.length }))
  );

  // Sort items alphabetically within each bucket and concatenate
  const result: ShipmentItemSummary[] = [];
  
  // Process buckets in category order (excluding 42)
  filteredCategoryOrder.forEach(catId => {
    const bucketItems = buckets.get(catId) || [];
    if (bucketItems.length > 0) {
      const sortedBucket = bucketItems.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`✅ [sortShipmentItemsByCategoryOrder] Bucket ${catId}: ${sortedBucket.length} items, first: ${sortedBucket[0]?.name}`);
      result.push(...sortedBucket);
    }
  });
  
  // Add bucket 42 at the end
  const bucket42Items = buckets.get(42) || [];
  if (bucket42Items.length > 0) {
    const sortedBucket42 = bucket42Items.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`✅ [sortShipmentItemsByCategoryOrder] Bucket 42 (uncategorized): ${sortedBucket42.length} items`);
    result.push(...sortedBucket42);
  }

  console.log('🎯 [sortShipmentItemsByCategoryOrder] Final sort complete. Total items:', result.length,
    'First 5:', result.slice(0, 5).map(i => i.name)
  );

  return result;
}

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
    lineHeight: 1.2,
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
  productColIndented: { width: '40%', paddingHorizontal: 4, paddingLeft: 16 },
  quantityCol: { width: '30%', paddingHorizontal: 4, textAlign: 'center' },
  quantityColSecondary: { width: '30%', paddingHorizontal: 4, textAlign: 'center', color: '#666', fontSize: 8 },
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

function renderPage({shipment, itemsSummary, categoryOrder = [], categoryConnections = new Map()}: Props) {
  console.log('📄 [renderPage] Rendering page with:', {
    shipmentId: shipment.id,
    itemsCount: itemsSummary.length,
    categoryOrderLength: categoryOrder.length,
    categoryConnectionsSize: categoryConnections.size,
    willSort: categoryOrder.length > 0 && categoryConnections.size > 0
  });
  
  // Sort items by category order if provided
  const sortedItems = categoryOrder.length > 0 && categoryConnections.size > 0
    ? sortShipmentItemsByCategoryOrder(itemsSummary, categoryOrder, categoryConnections)
    : itemsSummary.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
              {/* Simple logo placeholder */}
                <Text style={styles.title}>
                  {fDate(shipment.date) === 'Invalid date' && typeof shipment.date === 'string' ? shipment.date : fDate(shipment.date)}
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
        {sortedItems.map((item, index) => {
          const isBundleItem = item.isBundleItem || false;
          const productColStyle = isBundleItem ? styles.productColIndented : styles.productCol;
          const quantityColStyle = isBundleItem ? styles.quantityColSecondary : styles.quantityCol;
          
          // Format quantity based on whether it's a bundle item
          let quantityText = '';
          if (isBundleItem && item.parentQuantity && item.individualQuantity) {
            // Bundle item format: "0.8 kg (2 x 0.4 kg)"
            const total = item.totalQuantity;
            const parent = item.parentQuantity;
            const individual = item.individualQuantity;
            const unit = item.unit || 'db';
            
            quantityText = `${total.toLocaleString('hu-HU', { 
              minimumFractionDigits: total % 1 === 0 ? 0 : 1, 
              maximumFractionDigits: 2 
            })} ${unit} (${parent} x ${individual.toLocaleString('hu-HU', { 
              minimumFractionDigits: individual % 1 === 0 ? 0 : 1, 
              maximumFractionDigits: 2 
            })} ${unit})`;
          } else {
            // Main product format
            const unit = item.unit || 'db';
            quantityText = `${item.totalQuantity.toLocaleString('hu-HU')} ${unit}`;
          }
          
          return (
            <View key={item.id + '-' + index} style={styles.tableRow}>
              <Text style={productColStyle}>
                {item.isBio && (
                  <Text style={{ fontSize: 8, color: '#2e7d32', fontWeight: 'bold', fontFamily: 'Roboto' }}>
                    [BIO]{' '}
                  </Text>
                )}            
                {item.name}
              </Text>
              <Text style={quantityColStyle}>
                {quantityText}
              </Text>
              <Text style={styles.notesCol} />
            </View>
          );
        })}
      </Page>
  );
}
// ----------------------------------------------------------------------

function ShipmentPDF({ shipment, itemsSummary, categoryOrder = [], categoryConnections = new Map() }: Readonly<Props>) {
  

  return (
    <Document>
      {renderPage({shipment, itemsSummary, categoryOrder, categoryConnections})}
    </Document>
  );
}

// ----------------------------------------------------------------------

export async function generateShipmentPDF(
  shipment: IShipment, 
  itemsSummary: ShipmentItemSummary[],
  categoryOrder?: number[],
  categoryConnections?: Map<string, number[]>
) {
  const blob = await pdf(
    <ShipmentPDF 
      shipment={shipment} 
      itemsSummary={itemsSummary}
      categoryOrder={categoryOrder}
      categoryConnections={categoryConnections}
    />
  ).toBlob();
  
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
  categoryOrder?: number[];
  categoryConnections?: Map<string, number[]>;
};

function MultiShipmentPDF({ shipmentsData, categoryOrder = [], categoryConnections = new Map() }: Readonly<MultiShipmentPDFProps>) {
  return (
    <Document>
      {shipmentsData.map(({ shipment, itemsSummary }, index) => (
        <Fragment key={shipment.id + '-' + index}>
          {renderPage({ shipment, itemsSummary, categoryOrder, categoryConnections })}
        </Fragment>
      ))}
    </Document>
  );
}

/**
 * Generate PDF for multiple shipments with each shipment on a new page
 */
export async function generateMultiShipmentPDF(
  shipmentsData: Array<{
    shipment: IShipment;
    itemsSummary: ShipmentItemSummary[];
  }>,
  categoryOrder?: number[],
  categoryConnections?: Map<string, number[]>
) {
  const blob = await pdf(
    <MultiShipmentPDF 
      shipmentsData={shipmentsData}
      categoryOrder={categoryOrder}
      categoryConnections={categoryConnections}
    />
  ).toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const shipmentDates = shipmentsData.map(s => s.shipment.date).join('-').replaceAll(', ', '_');
  link.download = `szallitasi-osszesitok-${shipmentDates}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}