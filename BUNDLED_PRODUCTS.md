# Bundled Products Feature

## Overview
This feature allows you to create bundle products (product boxes) that contain multiple other products with specific quantities. For example, you can create a "Vegetable Box" that contains 2kg of tomatoes, 1kg of cucumbers, and 3 pieces of paprika.

## Database Schema

### ProductsInBoxes Table
The `ProductsInBoxes` table is a junction table that links bundle products to their contained products:

```sql
CREATE TABLE public."ProductsInBoxes" (
  "boxId" bigint NOT NULL,           -- The bundle product ID (references Products.id)
  "productId" bigint NOT NULL,        -- The contained product ID (references Products.id)
  "qty" double precision NOT NULL,    -- Quantity of the product in the bundle
  PRIMARY KEY ("boxId", "productId")
);
```

**⚠️ IMPORTANT - Migration Required:**

You **MUST** run the migration file to add the `boxId` column before using bundle products:

```sql
-- Run this in your Supabase SQL Editor or via psql
\i database/migrations/003_add_boxid_to_products_in_boxes.sql
```

Or copy/paste the contents of `database/migrations/003_add_boxid_to_products_in_boxes.sql` into your Supabase SQL Editor and execute it.

**Without running this migration:**
- Bundle items will not load
- You'll see errors in the console: `Error fetching bundle items`
- The feature will not work

### Products Table
The `Products` table now includes a `type` field:
- `'simple'`: Regular standalone product
- `'bundle'`: A bundle/box containing other products

## Features

### 1. Product Type Switch
- Located at the top-right of the product form
- Toggle between "Simple Product" and "Bundle Product"
- Switching to simple will clear any bundle items

### 2. Bundle Items Management
When a product is set as a bundle, a "Csomag tartalma" (Bundle Contents) card appears with:

#### Add Items
- Click the "Hozzáadás" (Add) button
- Search and select a product using autocomplete
- Set the quantity for that product
- View product unit and price information
- Confirm to add to bundle

#### View Items
Bundle items are displayed in a table showing:
- Product image and name
- SKU
- Quantity
- Unit of measurement
- Gross price

#### Edit Items
- Click the edit icon (pen) next to any item
- Modify the quantity
- Save changes

#### Delete Items
- Click the delete icon (trash) next to any item
- Confirm deletion in the modal dialog
- Item is removed from the bundle

### 3. Validation
- Bundle items are saved when the main product form is submitted
- Only products that are not already in the bundle can be added
- Each product can only appear once per bundle
- Quantities must be positive numbers (minimum 0.1)

## Usage Example

### Creating a Vegetable Bundle

1. **Create/Edit Product**
   - Navigate to Dashboard → Products → New Product
   - Enter basic product details (name, URL, categories, etc.)

2. **Set as Bundle**
   - Toggle the "Csomag termék" (Bundle Product) switch to ON
   - The "Csomag tartalma" (Bundle Contents) section appears

3. **Add Products to Bundle**
   - Click "Hozzáadás" (Add)
   - Search for "Tomato" and select it
   - Set quantity: 2 (kg)
   - Click "Hozzáadás" (Add)
   
   - Repeat for "Cucumber": 1 kg
   - Repeat for "Paprika": 3 db

4. **Save**
   - Complete other required fields (pricing, etc.)
   - Click "Termék létrehozása" (Create Product)
   - Bundle items are automatically saved

### Editing a Bundle

1. Open an existing bundle product for editing
2. Bundle items are automatically loaded and displayed
3. Add, edit, or remove items as needed
4. Save to persist changes

## API / Actions

### Bundle Items Actions (`src/actions/bundle-items.ts`)

#### `fetchBundleItems(productId: string): Promise<IBundleItem[]>`
Fetches all items in a bundle for a specific product.

```typescript
const items = await fetchBundleItems('123');
// Returns: [{ productId: '456', qty: 2, product: {...} }, ...]
```

#### `updateBundleItems(boxId: string, items: Array<{productId: string, qty: number}>): Promise<void>`
Replaces all bundle items for a product. Deletes existing items and inserts new ones.

```typescript
await updateBundleItems('123', [
  { productId: '456', qty: 2 },
  { productId: '789', qty: 1 }
]);
```

#### `deleteBundleItem(boxId: string, productId: string): Promise<void>`
Deletes a single item from a bundle.

```typescript
await deleteBundleItem('123', '456');
```

## Components

### AddBundleItemModal
**Location:** `src/sections/product/new-edit-form/add-bundle-item-modal.tsx`

Modal dialog for adding/editing bundle items with:
- Product autocomplete search
- Quantity input field
- Product information preview (unit, price)
- Save/Cancel actions

**Props:**
- `open`: boolean - Modal visibility
- `onClose`: () => void - Close handler
- `onAdd`: (item) => void - Add/update handler
- `existingProductIds`: string[] - IDs of products already in bundle
- `editItem`: IBundleItem | null - Item being edited (null for new item)

### BundleItemsCard
**Location:** `src/sections/product/new-edit-form/bundle-items-card.tsx`

Expandable card displaying bundle contents with:
- Collapsible header
- "Hozzáadás" (Add) button
- Table of bundle items
- Edit/Delete actions per item
- Empty state message

**Props:**
- `isOpen`: UseBoolean - Card collapse state
- `bundleItems`: IBundleItem[] - Array of bundle items
- `onAddItem`: (item) => void - Add item handler
- `onUpdateItem`: (productId, qty) => void - Update item handler
- `onDeleteItem`: (productId) => void - Delete item handler

## Types

### ProductType
```typescript
type ProductType = 'simple' | 'bundle';
```

### IBundleItem
```typescript
type IBundleItem = {
  productId: string;
  qty: number;
  product?: IProductItem;  // Populated when fetching from database
};
```

## Schema Updates

### NewProductSchema
Added `type` field to the form schema:
```typescript
type: zod.enum(['simple', 'bundle']).default('simple')
```

## Future Enhancements

Potential improvements for future iterations:

1. **Bulk Operations**
   - Import bundle items from CSV
   - Copy bundle structure to new product

2. **Bundle Pricing**
   - Auto-calculate bundle price from component products
   - Discount/markup options for bundles

3. **Inventory Management**
   - Track bundle stock based on component availability
   - Alert when component products are low

4. **Bundle Templates**
   - Save common bundle configurations as templates
   - Quick-apply templates to new products

5. **Nested Bundles**
   - Allow bundles to contain other bundles
   - Recursive quantity calculations

6. **Visual Builder**
   - Drag-and-drop interface for building bundles
   - Visual preview of bundle contents

## Troubleshooting

### Bundle items not saving
- Check that the product has been saved first (needs an ID)
- Verify database migration has been applied
- Check browser console for errors

### Bundle items not loading
- Verify `boxId` column exists in `ProductsInBoxes` table
- Check product `type` field is set to 'bundle'
- Inspect network tab for failed requests

### Products not appearing in search
- Ensure products have `publish: true`
- Check that products are not already in the bundle
- Verify products exist in database

## Testing Checklist

- [ ] Create a new bundle product
- [ ] Add multiple items to bundle
- [ ] Edit item quantity
- [ ] Delete item from bundle
- [ ] Save bundle and verify persistence
- [ ] Edit existing bundle
- [ ] Switch product from bundle to simple (and back)
- [ ] Verify bundle items load correctly on page refresh
- [ ] Test with products that have different units
- [ ] Verify validation (duplicate products, negative quantities)
