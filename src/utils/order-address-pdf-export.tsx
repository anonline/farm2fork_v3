import type { IOrderData } from 'src/types/order-management';
import type { IPickupLocation } from 'src/types/pickup-location';

import React from 'react';
import { pdf, Page, Text, View, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { supabase } from 'src/lib/supabase';

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

type OrderAddressItem = {
  orderId: string;
  customerName: string;
  shippingAddress: string;
  pickupLocationName?: string; // For sorting pickup locations
};

type Props = {
  orders: OrderAddressItem[];
  title?: string;
  subtitle?: string;
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
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'normal',
    marginBottom: 4,
  },
  section: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    paddingVertical: 4,
    alignItems: 'center',
    minHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000',
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  orderIdCol: { width: '15%', paddingHorizontal: 4 },
  customerNameCol: { width: '30%', paddingHorizontal: 4 },
  addressCol: { width: '55%', paddingHorizontal: 4 },
  companyInfo: {
    textAlign: 'right',
    fontSize: 7,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1pt solid #000',
  },
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

function OrderAddressListDocument({ orders, title = 'Címlista', subtitle }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.companyInfo}>
            <Text>Farm2Fork</Text>
            <Text>Szállítási címlista</Text>
            <Text>Dátum: {new Date().toLocaleDateString('hu-HU')}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={styles.orderIdCol}>Rendelés ID</Text>
          <Text style={styles.customerNameCol}>Ügyfél neve</Text>
          <Text style={styles.addressCol}>Szállítási cím</Text>
        </View>

        {/* Table Rows */}
        {orders.map((order, index) => (
          <View key={`${order.orderId}-${index}`} style={styles.tableRow}>
            <Text style={styles.orderIdCol}>{order.orderId}</Text>
            <Text style={styles.customerNameCol}>{order.customerName}</Text>
            <Text style={styles.addressCol}>{order.shippingAddress}</Text>
          </View>
        ))}

        {/* Total count */}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Összes rendelés: {orders.length} db</Text>
        </View>
      </Page>
    </Document>
  );
}

// ----------------------------------------------------------------------

/**
 * Formats shipping address from order data into a single string
 */
function formatShippingAddress(order: IOrderData): string {
  const addr = order.shippingAddress;
  
  if (!addr) {
    return 'Nincs cím megadva';
  }

  // Build address parts
  const parts: string[] = [];
  
  // Add postcode and city
  if (addr.postcode || addr.city) {
    const location = [addr.postcode, addr.city].filter(Boolean).join(' ');
    if (location) parts.push(location);
  }
  
  // Add street address with house number
  const streetParts: string[] = [];
  if (addr.street) streetParts.push(addr.street);
  if (addr.houseNumber) streetParts.push(addr.houseNumber);
  if (streetParts.length > 0) {
    parts.push(streetParts.join(' '));
  }
  
  // Add floor and doorbell if exists
  if (addr.floor) {
    parts.push(`${addr.floor}. emelet`);
  }
  if (addr.doorbell) {
    parts.push(`Csengő: ${addr.doorbell}`);
  }
  
  // Add note if exists
  if (addr.note) {
    parts.push(`(${addr.note})`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Nincs cím megadva';
}

/**
 * Generates a PDF with order addresses from the provided orders.
 * Orders are sorted by: 1) address, 2) customer name.
 * For "Személyes átvétel" orders, the pickup location name is prepended to the address.
 * 
 * @param orders - Array of order data
 * @param title - Optional title for the PDF (default: 'Címlista')
 * @param subtitle - Optional subtitle for the PDF (should contain shipment dates)
 * @returns Promise that resolves when the PDF is downloaded
 */
export async function generateOrderAddressPDF(
  orders: IOrderData[],
  title?: string,
  subtitle?: string
): Promise<void> {
  try {
    // Fetch pickup locations for personal pickup orders
    let pickupLocations: IPickupLocation[] = [];
    try {
      
      const { data: locations } = await supabase
        .from('PickupLocations')
        .select('*')
        .order('name', { ascending: true });
      pickupLocations = locations || [];
    } catch (error) {
      console.warn('Failed to fetch pickup locations:', error);
    }

    // Transform orders into address items
    const addressItems: OrderAddressItem[] = orders.map(order => {
      let pickupLocationName: string | undefined;
      let shippingAddressDisplay = formatShippingAddress(order);
      
      // If it's personal pickup, try to find the pickup location
      const isPersonalPickup = order.shippingMethod?.name === 'Személyes átvétel';
      
      if (isPersonalPickup && order.shippingAddress?.id) {
        const pickupLocation = pickupLocations.find(
          loc => (loc.postcode + ' ' + loc.city + ' ' + loc.address) 
          === (order.shippingAddress?.postcode + ' ' + order.shippingAddress?.city + ' ' + order.shippingAddress?.street + ' ' + order.shippingAddress?.houseNumber)
        );
        
        if (pickupLocation) {
          pickupLocationName = pickupLocation.name;
          // Prepend pickup location name to address
          shippingAddressDisplay = `${pickupLocation.name} - ${shippingAddressDisplay}`;
        }
      }
      
      return {
        orderId: order.id,
        customerName: order.customerName,
        shippingAddress: shippingAddressDisplay,
        pickupLocationName,
      };
    });

    // Sort by: 1) address (with pickup location name if present), 2) customer name
    addressItems.sort((a, b) => {
      // Compare address (which now includes pickup location name for personal pickups)
      const addressCompare = a.shippingAddress.localeCompare(b.shippingAddress, 'hu');
      if (addressCompare !== 0) return addressCompare;
      
      // Finally compare customer name
      return a.customerName.localeCompare(b.customerName, 'hu');
    });

    // Generate PDF
    const blob = await pdf(
      <OrderAddressListDocument 
        orders={addressItems} 
        title={title}
        subtitle={subtitle}
      />
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename from subtitle (which contains shipment dates)
    let filename = 'cimlista';
    if (subtitle) {
      // Extract dates from subtitle like "Szállítás: 2024.01.15" or "Szállítás: 2024.01.15, 2024.01.20"
      const dateMatch = subtitle.match(/Szállítás:\s*(.+)/);
      if (dateMatch) {
        // Replace dots, commas, and spaces with underscores for filename
        const cleanedDates = dateMatch[1]
          .replace(/\./g, '')
          .replace(/,\s*/g, '_')
          .replace(/\s+/g, '_');
        filename = `cimlista_${cleanedDates}`;
      }
    }
    
    link.download = `${filename}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating order address PDF:', error);
    throw error;
  }
}
