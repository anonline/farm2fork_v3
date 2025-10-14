# Category Order Feature

This feature allows you to customize the display order of product categories throughout the application using a drag-and-drop interface.

## Overview

The category order is stored in the database and applies to:
- Category listings on the website
- Product displays (products inherit the order of their categories)
- Category navigation menus

## Database Setup

### Migration

Run the migration to add the category order option:

```sql
-- File: database/migrations/004_add_category_order_option.sql

INSERT INTO public."Options" (name, value, type)
VALUES ('category_order', '[]', 'json')
ON CONFLICT (name) DO NOTHING;
```

The `category_order` option stores a JSON array of category IDs representing the desired display order:
```json
["3", "1", "5", "2", "4"]
```

## Usage

### Admin Interface

1. Navigate to `/dashboard/documents/productorder`
2. View all categories with their parent hierarchy displayed in muted style above each category name
   - Example: For category "Alma" → Shows "Összes Termék/Gyümölcsök" (muted) above "Alma" (normal)
3. Drag and drop categories to reorder them
4. Click "Save Order" to persist changes
5. Use "Reset to A-Z" to restore alphabetical ordering

### Programmatic Usage

#### Client-Side

```typescript
import { useGetCategoryOrder, updateCategoryOrder } from 'src/actions/category-order';
import { sortCategoriesByCustomOrder } from 'src/utils/category-order';

// Hook to get the current category order
const { categoryOrder, categoryOrderLoading } = useGetCategoryOrder();

// Sort categories using the custom order
const sortedCategories = sortCategoriesByCustomOrder(categories, categoryOrder);

// Update the order
await updateCategoryOrder([1, 2, 3, 4, 5]);
```

#### Server-Side

```typescript
import { getCategoryOrder } from 'src/actions/category-order-ssr';
import { sortCategoriesByCustomOrder } from 'src/utils/category-order';

// Fetch the current category order
const categoryOrder = await getCategoryOrder();

// Sort categories using the custom order
const sortedCategories = sortCategoriesByCustomOrder(categories, categoryOrder);
```

## Utility Functions

### `sortCategoriesByCustomOrder(categories, categoryOrder)`

Sorts an array of categories based on a custom order array.

**Parameters:**
- `categories: ICategoryItem[]` - Array of categories to sort
- `categoryOrder: number[]` - Array of category IDs in desired order

**Returns:** `ICategoryItem[]` - Sorted categories

**Behavior:**
- Categories in the order array are sorted according to their position
- Categories not in the order array appear at the end, sorted alphabetically
- Maintains category hierarchy (parent-child relationships)

### `sortProductsByCategoryOrder(products, categoryOrder, categoryConnections?)`

Sorts products based on their categories' custom order.

**Parameters:**
- `products: IProductItem[]` - Array of products to sort
- `categoryOrder: number[]` - Array of category IDs in desired order
- `categoryConnections?: Array<{productId: number, categoryId: number}>` - Optional product-category relationships

**Returns:** `IProductItem[]` - Sorted products

**Behavior:**
- Products are sorted by their first (best) category's position in the order
- Products without categories or with unordered categories appear at the end

### `getTopLevelCategories(categories)`

Filters categories to return only top-level (root) categories.

### `getChildCategories(categories, parentId)`

Returns all child categories for a specific parent category.

## Implementation Details

### Files Created/Modified

1. **Database Migration**: `database/migrations/004_add_category_order_option.sql`
2. **Type Definition**: `src/types/option.ts` - Added `CategoryOrder` enum
3. **Client Actions**: `src/actions/category-order.ts` - Client-side hooks and functions
4. **Server Actions**: `src/actions/category-order-ssr.ts` - Server-side functions
5. **Utility Functions**: `src/utils/category-order.ts` - Reusable sorting functions
6. **Dashboard Page**: `src/app/dashboard/documents/productorder/page.tsx`
7. **View Component**: `src/sections/category/view/category-order-view.tsx`
8. **Category Context**: `src/contexts/category-context.tsx` - Updated to apply custom order

### How It Works

1. **Storage**: The custom order is stored as a JSON array in the `Options` table
2. **Fetching**: When categories are loaded, the custom order is fetched and applied
3. **Sorting**: The utility functions sort categories/products based on the custom order
4. **UI**: The drag-and-drop interface provides an easy way to reorder categories
5. **Persistence**: Changes are saved to the database immediately upon clicking "Save Order"

### Drag and Drop

The implementation uses `@dnd-kit` for drag-and-drop functionality:
- Vertical list sorting strategy
- Keyboard, mouse, and touch support
- Visual feedback during dragging
- Optimistic UI updates

## Notes

- All categories (top-level and nested) can be reordered
- Parent hierarchy is displayed in muted/italic style above each category name
- The order applies globally across the entire application
- Changes take effect immediately after saving
- If no custom order is set, categories default to alphabetical sorting

## Display Format

Categories are displayed with their full parent hierarchy:

```
Összes Termék/Gyümölcsök    ← muted, italic style
Alma                         ← normal style

Összes Termék               ← muted, italic style (if has parent)
Zöldségek                   ← normal style
```

This makes it easy to identify which categories belong where in the hierarchy while allowing flexible reordering.

## Future Enhancements

Possible improvements:
- Add bulk operations (e.g., reverse order, random order)
- Add category grouping/filtering by parent
- Add preview mode before saving
- Add undo/redo functionality
- Add search/filter functionality for large category lists
