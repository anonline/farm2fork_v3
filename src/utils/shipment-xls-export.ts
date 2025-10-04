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

// ----------------------------------------------------------------------
export function generateMultiSheetShipmentXLS(
    shipmentsData: { shipment: IShipment; itemsSummary: ShipmentItemSummary[] }[]
) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    shipmentsData.forEach(({ shipment, itemsSummary }, index) => {
        XLSX.utils.book_append_sheet(wb, generateSheet(shipment, itemsSummary), `${shipment.date}`);
    });

    // Generate filename
    const fileName = `szallitasi-osszesito-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
}

export function generateShipmentXLS(shipment: IShipment, itemsSummary: ShipmentItemSummary[]) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, generateSheet(shipment, itemsSummary), 'Szállítási összesítő');

    // Generate filename
    const fileName = `szallitasi-osszesito-${shipment.id}-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
}

function generateSheet(shipment: IShipment, itemsSummary: ShipmentItemSummary[]): XLSX.WorkSheet {
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
        'BIO',
        '',
        'Mennyiség',
        'Rendelések száma',
        'Vásárlók száma',
        'Vásárlók listája',
        'Megjegyzés',
    ];

    const itemsData = itemsSummary.map((item) => {
        const isBundleItem = item.isBundleItem || false;
        
        // Format product name with indentation for bundle items
        let productName = (item.isBio ? '[BIO] ' : '') + item.name;
        if (isBundleItem) {
            productName = `    ${(item.isBio ? '[BIO] ' : '')}${item.name}`; // 4 spaces indentation
        }
        
        // Format quantity and notes based on whether it's a bundle item
        let quantityText = '';
        let notesText = '';
        
        if (isBundleItem && item.parentQuantity && item.individualQuantity) {
            // Bundle item - quantity only shows total
            const total = item.totalQuantity;
            const parent = item.parentQuantity;
            const individual = item.individualQuantity;
            const unit = item.unit || 'db';
            
            quantityText = `${total.toLocaleString('hu-HU', { 
                minimumFractionDigits: total % 1 === 0 ? 0 : 1, 
                maximumFractionDigits: 2 
            })} ${unit}`;
            
            // Breakdown goes to notes column
            notesText = `${parent} x ${individual.toLocaleString('hu-HU', { 
                minimumFractionDigits: individual % 1 === 0 ? 0 : 1, 
                maximumFractionDigits: 2 
            })} ${unit}`;
        } else {
            // Main product format
            const unit = item.unit || 'db';
            quantityText = `${item.totalQuantity.toLocaleString('hu-HU')} ${unit}`;
            // notesText remains empty for main products
        }
        
        // Determine BIO status display
        let bioStatus = item.isBio ? 'IGEN' : 'NEM';
        
        return [
            productName,
            bioStatus,
            '', // Empty column (removed unit)
            quantityText,
            isBundleItem ? '' : item.orderCount, // Don't show order count for bundle items
            isBundleItem ? '' : item.customersCount, // Don't show customer count for bundle items
            isBundleItem ? '' : item.customers.join(', '), // Don't show customer list for bundle items
            notesText, // Breakdown for bundle items, empty for main products
        ];
    });

    // Calculate totals (only for main products, not bundle items)
    const mainProducts = itemsSummary.filter(item => !item.isBundleItem);
    const totalOrders = mainProducts.reduce((sum, item) => sum + item.orderCount, 0);
    const totalCustomers = new Set(mainProducts.flatMap(item => item.customers)).size;
    

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

    // Style bundle item rows (make them visually distinct)
    itemsSummary.forEach((item, index) => {
        if (item.isBundleItem) {
            const rowIndex = headerRowIndex + 1 + index;
            for (let col = 0; col <= 7; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        font: { italic: true, color: { rgb: '666666' } },
                        alignment: { horizontal: col === 0 ? 'left' : 'center' },
                    };
                }
            }
        }
    });

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
