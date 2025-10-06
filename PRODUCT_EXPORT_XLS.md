# Product Export to XLSX - Implementation Guide

## Overview
Added functionality to export all products to an Excel (XLSX) file regardless of current filtering. The export includes all specified columns with proper formatting.

## Files Modified/Created

### 1. New File: `src/utils/product-xls-export.ts`
- Created a utility function `generateProductsXLS()` that exports products to XLSX format
- Uses the `xlsx` library (already installed in the project)
- Exports with the following columns:
  - ID
  - Név (Name)
  - Slug
  - BIO (Yes/No)
  - SKU
  - Termelő ID (Producer ID)
  - Termelő név (Producer Name)
  - Keresési szinonímák (Search Tags)
  - Nettó ár (Net Price)
  - ÁFA (VAT)
  - Bruttó ár (Gross Price)
  - Nettó ár VIP (Net Price VIP)
  - Nettó ár Céges (Net Price Company)
  - Elérhető Publikus (Available Public)
  - Elérhető VIP (Available VIP)
  - Elérhető Céges (Available Company)
  - Készlet (Stock)
  - Készletkezelés (Stock Handling)

### 2. Modified: `src/sections/product/view/product-list-view.tsx`
- Added import for `generateProductsXLS` utility
- Created `handleExportAllToXLS()` callback that exports ALL products (not just filtered)
- Updated `CustomToolbar` component to include export button
- Added `onExportAllToXLS` prop to `CustomToolbarProps` type
- Integrated export button in the toolbar alongside other actions

## Features

### Export Button
- Located in the product list toolbar (top right area)
- Button text: "Export XLS"
- Icon: Table icon (`mingcute:table-2-fill`)
- Styled as outlined primary button
- Shows success/error toast notifications

### Export Behavior
- Exports **ALL products** from the database, regardless of:
  - Current filters (publish status, BIO, categories)
  - Search queries
  - Pagination
- File naming: `termekek-export-YYYY-MM-DD.xlsx`
- Column widths are auto-sized for readability
- Header row is styled with bold font and gray background

### Data Formatting
- Boolean values: "IGEN" (Yes) / "NEM" (No)
- Prices: Formatted to 2 decimal places
- Tags: Comma-separated list
- Stock (Készlet): Displays the actual stock value or empty if null
- Stock Handling (Készletkezelés): 
  - "IGEN" if stock is NOT null (whether 0, negative, or positive)
  - "NEM" if stock IS null
- Empty/null values: Handled gracefully with empty strings or defaults

## Usage

1. Navigate to the product list page (`/dashboard/product`)
2. Click the "Export XLS" button in the toolbar
3. The browser will download the Excel file automatically
4. File contains all products with all specified columns

## Technical Notes

- Uses existing `useProducts()` context to access all products
- Export function runs client-side (no server API call needed)
- Toast notifications provide user feedback
- Error handling included with try-catch and error toasts
- Type-safe implementation with TypeScript

## Dependencies
- `xlsx` (version ^0.18.5) - already installed
- `@types/xlsx` (version ^0.0.35) - already installed

## Testing Recommendations

1. **Basic Export**: Click export button and verify file downloads
2. **Data Accuracy**: Check that all columns contain correct data
3. **Large Dataset**: Test with many products to ensure performance
4. **Edge Cases**: Test with products that have null/undefined values
5. **Filtering Independence**: Apply filters, then export to verify ALL products export (not just filtered)

## Future Enhancements (Optional)

1. Add option to export filtered products only
2. Add option to export selected products only
3. Include product images as URLs or embedded
4. Add category names in addition to IDs
5. Include additional fields (description, featured, etc.)
6. Add export to CSV format
7. Add custom column selection dialog
