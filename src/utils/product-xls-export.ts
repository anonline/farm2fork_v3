import type { IProductItem } from 'src/types/product';

import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

/**
 * Export all products to XLSX file regardless of filtering
 * @param products - Array of all products to export
 */
export function generateProductsXLS(products: IProductItem[]) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Prepare header row
    const headers = [
        'ID',
        'Név',
        'Slug',
        'BIO',
        'SKU',
        'Termelő ID',
        'Termelő név',
        'Keresési szinonímák',
        'Nettó ár',
        'ÁFA',
        'Bruttó ár',
        'Nettó ár VIP',
        'Nettó ár Céges',
        'Elérhető Publikus',
        'Elérhető VIP',
        'Elérhető Céges',
        'Készlet',
        'Készletkezelés',
    ];

    // Prepare data rows
    const dataRows = products.map((product) => [
        product.id,
        product.name,
        product.url || '',
        product.bio ? 'IGEN' : 'NEM',
        product.sku || '',
        product.producerId || '',
        product.producer?.name || '',
        product.tags?.join(', ') || '',
        product.netPrice?.toFixed(1) || '0.0',
        product.vat || 0,
        product.grossPrice?.toFixed(1) || '0.0',
        product.netPriceVIP?.toFixed(1) || '0.0',
        product.netPriceCompany?.toFixed(1) || '0.0',
        product.isPublic ? 'IGEN' : 'NEM',
        product.isVip ? 'IGEN' : 'NEM',
        product.isCorp ? 'IGEN' : 'NEM',
        product.stock !== null ? product.stock : '',
        product.stock !== null ? 'IGEN' : 'NEM',
    ]);

    // Combine headers and data
    const allData = [headers, ...dataRows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    const colWidths = [
        { wch: 36 }, // ID
        { wch: 40 }, // Név
        { wch: 30 }, // Slug
        { wch: 8 },  // BIO
        { wch: 15 }, // SKU
        { wch: 36 }, // Termelő ID
        { wch: 30 }, // Termelő név
        { wch: 40 }, // Keresési szinonímák
        { wch: 12 }, // Nettó ár
        { wch: 8 },  // ÁFA
        { wch: 12 }, // Bruttó ár
        { wch: 14 }, // Nettó ár VIP
        { wch: 16 }, // Nettó ár Céges
        { wch: 18 }, // Elérhető Publikus
        { wch: 14 }, // Elérhető VIP
        { wch: 15 }, // Elérhető Céges
        { wch: 10 }, // Készlet
        { wch: 18 }, // Készletkezelés
    ];

    ws['!cols'] = colWidths;

    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E0E0E0' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };
    }

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Termékek');

    // Generate filename with timestamp
    const fileName = `termekek-export-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
}
