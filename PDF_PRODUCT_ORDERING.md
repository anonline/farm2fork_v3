# PDF Product Ordering Implementation

## Overview
This document describes the implementation of product ordering by category in shipping label PDFs. Products are now sorted based on the custom category order defined in `/dashboard/documents/productorder`.

## Implementation Details

### 1. Core Sorting Function
**Location**: `src/utils/pdf-generator.tsx`

Added `sortOrderItemsByCategoryOrder()` function that:
- Takes order product items, category order array, and category connections map
- Finds the "closest" (earliest in order) category for each product
- Handles products in multiple categories by selecting the best position
- Products without ordered categories appear at the end

### 2. Category Connections Helper
**Location**: `src/utils/pdf-generator.tsx`

Added `fetchCategoryConnectionsForOrders()` async function that:
- Collects all unique product IDs from orders
- Fetches category connections from `ProductCategories_Products` table in a single query
- Returns a `Map<string, number[]>` mapping product ID to array of category IDs
- **Performance optimized**: Fetches all connections once for bulk operations (150+ PDFs)

### 3. PDF Component Updates
**Modified Components**:
- `ShippingLabelPDFPage` - Main PDF page component
- `ShippingLabelPDF` - Document wrapper
- `MultipleShippingLabelsPDF` - Multi-order document wrapper

**Changes**:
- Added optional `categoryOrder` and `categoryConnections` props
- Uses `React.useMemo` to cache sorted items (performance optimization)
- Products sorted before rendering table rows

### 4. PDF Generation Functions
**Functions Updated**:
- `generateShippingLabelPDF()` - Single order PDF
- `generateMultipleShippingLabelsPDF()` - Multiple orders PDF (bulk)

**New Parameters** (all optional):
- `categoryOrder?: number[]` - Array of category IDs in custom order
- `categoryConnections?: Map<string, number[]>` - Product-to-categories mapping

### 5. Integration Points

#### Single Order PDF
**Location**: `src/sections/order/order-details-toolbar.tsx`

```typescript
const { categoryOrder } = useGetCategoryOrder();

const handleGeneratePDF = async () => {
    const categoryConnections = await fetchCategoryConnectionsForOrders([order]);
    await generateShippingLabelPDF(order, pickupLocations, categoryOrder, categoryConnections);
};
```

#### Multiple Orders PDF (Bulk)
**Location**: `src/sections/order/view/order-list-view.tsx`

```typescript
const { categoryOrder } = useGetCategoryOrder();

const handleGenerateShippingLabels = async () => {
    // Single query for all products in all selected orders
    const categoryConnections = await fetchCategoryConnectionsForOrders(selectedOrders);
    await generateMultipleShippingLabelsPDF(selectedOrders, pickupLocations, categoryOrder, categoryConnections);
};
```

## Performance Considerations

### Bulk PDF Generation (150+ PDFs)
1. **Single Database Query**: `fetchCategoryConnectionsForOrders()` fetches all category connections in one query
2. **Memoization**: `React.useMemo` caches sorted items per order to avoid re-sorting
3. **Efficient Lookup**: Uses `Map` data structure for O(1) category position lookup
4. **No Re-fetching**: Category connections fetched once and reused for all PDFs

### Memory Usage
- Category connections stored in memory as Map for fast access
- Map size depends on number of unique products (typically < 1000 products)
- Minimal overhead per product (product ID + array of category IDs)

## Product Sorting Logic

### Multiple Categories Handling
When a product belongs to multiple categories (e.g., "Red Apple" in "All", "Fruits", "Apples"):
1. Get all category IDs for the product: `[1, 15, 23]`
2. Map each to its position in category order: `[0, 3, undefined]` (if order is `[1, 5, 9, 15]`)
3. Take the **lowest position** (closest to start): `0`
4. Sort by this "best" position

### Products Without Categories
- Products with no categories appear at end
- Products with unordered categories also appear at end
- Original order maintained within unordered products

## Backward Compatibility

All changes are **backward compatible**:
- Category order parameters are optional
- If not provided, products appear in original order
- Existing PDF generation calls work without modification
- New parameters can be added incrementally

## Data Flow

```
User Request (Generate PDF)
    ↓
Fetch Category Order (useGetCategoryOrder hook)
    ↓
Fetch Category Connections (fetchCategoryConnectionsForOrders)
    ↓
Pass to PDF Generator (generateShippingLabelPDF/Multiple)
    ↓
Sort Products (sortOrderItemsByCategoryOrder with useMemo)
    ↓
Render PDF with Sorted Products
```

## Testing Checklist

- [ ] Single order PDF generation with category order
- [ ] Multiple orders PDF generation (bulk operation)
- [ ] Products with single category
- [ ] Products with multiple categories
- [ ] Products without categories
- [ ] Orders with no category order set (empty array)
- [ ] Performance test with 150+ simultaneous PDFs
- [ ] Memory usage monitoring during bulk generation

## Files Modified

1. `src/utils/pdf-generator.tsx` - Core implementation
2. `src/sections/order/order-details-toolbar.tsx` - Single order integration
3. `src/sections/order/view/order-list-view.tsx` - Bulk orders integration

## Dependencies

- Existing: `@react-pdf/renderer`, `@supabase/supabase-js`
- New imports: `useGetCategoryOrder` from `src/actions/category-order`
- Database: `ProductCategories_Products` junction table

## Future Enhancements

1. **Cache category connections** in React context for even better performance
2. **Persist category connections** with order data when order is created
3. **Add category names** to PDF if requested by user
4. **Sort by subcategory** within main category if needed
5. **Server-side caching** of category connections for frequently accessed products
