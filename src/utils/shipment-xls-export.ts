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
        'Egység',
        'Mennyiség',
        'Rendelések száma',
        'Vásárlók száma',
        'Vásárlók listája',
        'Megjegyzés',
    ];

    const itemsData = itemsSummary.map((item) => [
        item.name,
        item.isBio ? 'IGEN' : 'NEM',
        item.unit || '',
        item.totalQuantity,
        item.orderCount,
        item.customersCount,
        item.customers.join(', '),
        '',
    ]);

    // Calculate totals
    const totalQuantity = itemsSummary.reduce((sum, item) => sum + item.totalQuantity, 0);
    

    // Add totals row
    const totalsRow = ['ÖSSZESEN', '', '', totalQuantity, '', '', '', ''];

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
        { wch: 25 }, // A - Termék név / Label
        { wch: 20 }, // B - BIO
        { wch: 10 }, // D - Egység
        { wch: 12 }, // E - Mennyiség
        { wch: 20 }, // H - Rendelések száma
        { wch: 20 }, // I - Vásárlók száma
        { wch: 30 }, // J - Vásárlók listája
        { wch: 50 }, // K - Megjegyzés
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
