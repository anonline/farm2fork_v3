import type { IShipment } from 'src/types/shipments';

import * as XLSX from 'xlsx';

import { fDate } from './format-time';

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

type ConsolidatedItem = ShipmentItemSummary & {
    notes?: string;
};

/**
 * Consolidate bundle items with their simple product counterparts
 * Bundle items are merged into the main product row with notes showing the breakdown
 */
function consolidateBundleItems(items: ShipmentItemSummary[]): ConsolidatedItem[] {
    // Create a map to consolidate items by name-unit combination
    const consolidatedMap = new Map<string, ConsolidatedItem>();
    
    // Track simple quantities separately to build proper notes
    const simpleQuantities = new Map<string, number>();

    items.forEach(item => {
        // Use id + name + unit as key to properly consolidate duplicate products
        const key = `${item.id}-${item.name}-${item.unit || 'db'}`;
        const existing = consolidatedMap.get(key);

        if (!item.isBundleItem) {
            // Simple product - track the quantity
            const currentSimple = simpleQuantities.get(key) || 0;
            simpleQuantities.set(key, currentSimple + item.totalQuantity);

            if (existing) {
                // Merge with existing simple product
                existing.totalQuantity += item.totalQuantity;
                existing.totalValue += item.totalValue;
                // Merge customers
                existing.customers = Array.from(new Set([...existing.customers, ...item.customers]));
                existing.customersCount = existing.customers.length;
                existing.orderCount += item.orderCount;
            } else {
                // First occurrence of this product
                consolidatedMap.set(key, {
                    ...item,
                    notes: undefined,
                });
            }
        } else {
            // Bundle item
            const bundleCount = item.parentQuantity || 1;
            const bundleIndividual = item.individualQuantity || 0;
            const unit = item.unit || 'db';

            const bundleNote = `${bundleCount} x ${bundleIndividual.toLocaleString('hu-HU', { 
                minimumFractionDigits: bundleIndividual % 1 === 0 ? 0 : 1, 
                maximumFractionDigits: 2 
            })} ${unit} csomag`;

            if (existing) {
                // Merge with existing product (simple or bundle)
                existing.totalQuantity += item.totalQuantity;
                existing.notes = existing.notes 
                    ? `${existing.notes} + ${bundleNote}`
                    : bundleNote;
            } else {
                // First occurrence - bundle only (no simple product)
                consolidatedMap.set(key, {
                    ...item,
                    isBundleItem: false, // Treat as normal product now
                    notes: bundleNote,
                });
            }
        }
    });

    // Build final notes with simple quantity prefix
    consolidatedMap.forEach((item, key) => {
        const simpleQty = simpleQuantities.get(key);
        if (simpleQty && item.notes) {
            // Has both simple and bundle - prepend simple quantity
            const unit = item.unit || 'db';
            const simpleNote = `${simpleQty.toLocaleString('hu-HU', { 
                minimumFractionDigits: simpleQty % 1 === 0 ? 0 : 1, 
                maximumFractionDigits: 2 
            })} ${unit} sima`;
            item.notes = `${simpleNote} + ${item.notes}`;
        }
    });

    return Array.from(consolidatedMap.values());
}

/**
 * Sort items by category order using bucket-based algorithm
 */
function sortItemsByCategoryOrder(
    items: ConsolidatedItem[],
    categoryOrder: number[],
    categoryConnections: Map<string, number[]>
): ConsolidatedItem[] {
    if (!categoryOrder || categoryOrder.length === 0) {
        return items.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Create buckets for each category in the order (excluding 42)
    const buckets = new Map<number, ConsolidatedItem[]>();
    
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

    // Place each item in the bucket of its highest position category
    items.forEach(item => {
        // Convert productId to string for Map lookup
        const productIdKey = item.productId ? String(item.productId) : '';
        const itemCategories = categoryConnections.get(productIdKey) || [];
        
        if (itemCategories.length === 0) {
            // No categories, put in bucket 42
            buckets.get(42)!.push(item);
            return;
        }

        // Find the highest position (most specific) category
        const orderedPositions = itemCategories
            .map(catId => ({ catId, position: orderMap.get(catId) }))
            .filter(({ position }) => position !== undefined)
            .sort((a, b) => b.position! - a.position!);

        if (orderedPositions.length === 0) {
            // Item has categories but none are in the order, put in bucket 42
            buckets.get(42)!.push(item);
            return;
        }

        // Use the highest position category
        const targetCategory = orderedPositions[0].catId;
        buckets.get(targetCategory)!.push(item);
    });

    // Sort items alphabetically within each bucket and concatenate
    const result: ConsolidatedItem[] = [];
    
    // Process buckets in category order (excluding 42)
    filteredCategoryOrder.forEach(catId => {
        const bucketItems = buckets.get(catId) || [];
        if (bucketItems.length > 0) {
            const sortedBucket = bucketItems.sort((a, b) => a.name.localeCompare(b.name));
            result.push(...sortedBucket);
        }
    });
    
    // Add bucket 42 at the end
    const bucket42Items = buckets.get(42) || [];
    if (bucket42Items.length > 0) {
        const sortedBucket42 = bucket42Items.sort((a, b) => a.name.localeCompare(b.name));
        result.push(...sortedBucket42);
    }

    return result;
}

// ----------------------------------------------------------------------
export function generateMultiSheetShipmentXLS(
    shipmentsData: { shipment: IShipment; itemsSummary: ShipmentItemSummary[] }[],
    categoryOrder?: number[],
    categoryConnections?: Map<string, number[]>
) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    shipmentsData.forEach(({ shipment, itemsSummary }, index) => {
        XLSX.utils.book_append_sheet(wb, generateSheet(shipment, itemsSummary, categoryOrder, categoryConnections), `${shipment.date}`);
    });

    // Generate filename
    const fileName = `szallitasi-osszesito-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
}

export function generateShipmentXLS(
    shipment: IShipment, 
    itemsSummary: ShipmentItemSummary[],
    categoryOrder?: number[],
    categoryConnections?: Map<string, number[]>
) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, generateSheet(shipment, itemsSummary, categoryOrder, categoryConnections), 'Szállítási összesítő');

    // Generate filename
    const fileName = `szallitasi-osszesito-${shipment.id}-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
}

function generateSheet(
    shipment: IShipment, 
    itemsSummary: ShipmentItemSummary[],
    categoryOrder: number[] = [],
    categoryConnections: Map<string, number[]> = new Map()
): XLSX.WorkSheet {
    // Consolidate bundle items with simple products
    const consolidatedItems = consolidateBundleItems(itemsSummary);

    // Sort by category order if provided
    const sortedItems = categoryOrder.length > 0 && categoryConnections.size > 0
        ? sortItemsByCategoryOrder(consolidatedItems, categoryOrder, categoryConnections)
        : consolidatedItems.sort((a, b) => a.name.localeCompare(b.name));

    // Prepare summary data
    const summaryData = [
        ['Szállítási összesítő részletei', ''],
        ['', ''],
        ['Összesítő ID:', shipment.id],
        [
            'Szállítási dátum:',
            fDate(shipment.date) && typeof shipment.date === 'string' ? shipment.date : fDate(shipment.date),
        ],
        ['Rendelések száma:', shipment.orderCount],
        ['Termékek száma:', shipment.productCount],
        ['Összérték (HUF):', shipment.productAmount],
        ['', ''],
        [
            'Létrehozva:',
            new Date().toLocaleDateString('hu-HU') + ' ' + new Date().toLocaleTimeString('hu-HU'),
        ],
        ['', ''],
    ];

    // Prepare items data
    const itemsHeader = [
        'Termék név',
        'Mennyiség',
        'BIO',
        '',
        'Rendelések száma',
        'Vásárlók száma',
        'Vásárlók listája',
        'Megjegyzés',
    ];

    const itemsData = sortedItems.map((item) => {
        // Format product name (no indentation needed since items are consolidated)
        const productName = (item.isBio ? '[BIO] ' : '') + item.name;
        
        // Format quantity
        const unit = item.unit || 'db';
        const quantityText = `${item.totalQuantity.toLocaleString('hu-HU', { 
            minimumFractionDigits: item.totalQuantity % 1 === 0 ? 0 : 1, 
            maximumFractionDigits: 2 
        })} ${unit}`;
        
        // Notes show bundle breakdown if present
        const notesText = item.notes || '';
        
        // Determine BIO status display
        const bioStatus = item.isBio ? 'IGEN' : 'NEM';
        
        return [
            productName,
            quantityText,
            bioStatus,
            '', // Empty column
            item.orderCount,
            item.customersCount,
            item.customers.join(', '),
            notesText, // Bundle breakdown or empty
        ];
    });

    // Calculate totals
    const totalOrders = sortedItems.reduce((sum, item) => sum + item.orderCount, 0);
    const totalCustomers = new Set(sortedItems.flatMap(item => item.customers)).size;
    

    // Add totals row
    const totalsRow = ['ÖSSZESEN', '', '', '', totalOrders, totalCustomers, '', ''];

    // Combine all data
    const allData = [
        ...summaryData,
        ['Termékek részletei', ''],
        ['', ''],
        itemsHeader,
        ...itemsData,
        ['', '', '', '', '', '', '', '', ''], // Empty row
        totalsRow,
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    const colWidths = [
        { wch: 35 }, // A - Termék név / Label (wider for indented bundle items)
        { wch: 10 }, // B - BIO
        { wch: 5 },  // C - Empty (removed Egység)
        { wch: 25 }, // D - Mennyiség (wider for formatted text)
        { wch: 18 }, // E - Rendelések száma
        { wch: 18 }, // F - Vásárlók száma
        { wch: 40 }, // G - Vásárlók listája
        { wch: 50 }, // H - Megjegyzés
    ];
    ws['!cols'] = colWidths;

    // Style the headers and important cells
    // Find the header row for items table
    const headerRowIndex = summaryData.length + 2; // +1 for "Termékek részletei", +1 for empty row

    // Style header cells
    for (let col = 0; col <= 9; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E3F2FD' } },
            border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };
    }

    // Style the title cell
    if (ws['A1']) {
        ws['A1'].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'left' },
        };
    }

    // Style the totals row
    const totalsRowIndex = headerRowIndex + itemsData.length + 1;
    for (let col = 0; col <= 9; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: totalsRowIndex, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFF3E0' } },
            border: {
                top: { style: 'thick' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };
    }

    return ws;
}
