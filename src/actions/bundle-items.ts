import type { IProductItem } from 'src/types/product';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export type IBundleItem = {
    productId: string;
    qty: number;
    product?: IProductItem;
};

// ----------------------------------------------------------------------

/**
 * Fetch all bundle items for a specific product
 * Note: This requires the boxId column in ProductsInBoxes table
 * Run the migration: database/migrations/003_add_boxid_to_products_in_boxes.sql
 */
export async function fetchBundleItems(productId: string): Promise<IBundleItem[]> {
    try {
        // Use the specific foreign key relationship to avoid ambiguity
        // ProductsInBoxes_productId_fkey links to the product that IS IN the bundle
        const { data, error } = await supabase
            .from('ProductsInBoxes')
            .select('productId, qty, product:Products!ProductsInBoxes_productId_fkey(*)')
            .eq('boxId', productId);

        if (error) {
            console.error('Error fetching bundle items:', {
                error,
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // If boxId column doesn't exist, the error code will be '42703' (undefined column)
            if (error.code === '42703') {
                console.warn('⚠️ boxId column does not exist in ProductsInBoxes table. Please run the migration: database/migrations/003_add_boxid_to_products_in_boxes.sql');
            }
            
            return [];
        }

        return (data || []).map((item: any) => ({
            productId: item.productId.toString(),
            qty: item.qty,
            product: item.product, // Note: changed from item.Products to item.product
        }));
    } catch (err) {
        console.error('Unexpected error in fetchBundleItems:', err);
        return [];
    }
}

// ----------------------------------------------------------------------

/**
 * Create or update bundle items for a product
 * Replaces all existing bundle items with the new list
 */
export async function updateBundleItems(
    boxId: string,
    bundleItems: { productId: string; qty: number }[]
): Promise<void> {
    // First, delete all existing bundle items for this box
    const { error: deleteError } = await supabase
        .from('ProductsInBoxes')
        .delete()
        .eq('boxId', boxId);

    if (deleteError) throw new Error(deleteError.message);

    // If there are no items to add, we're done
    if (!bundleItems.length) return;

    // Insert new bundle items
    const itemsToInsert = bundleItems.map((item) => ({
        boxId: Number(boxId),
        productId: Number(item.productId),
        qty: item.qty,
    }));

    const { error: insertError } = await supabase
        .from('ProductsInBoxes')
        .insert(itemsToInsert);

    if (insertError) throw new Error(insertError.message);
}

// ----------------------------------------------------------------------

/**
 * Delete a single bundle item
 */
export async function deleteBundleItem(boxId: string, productId: string): Promise<void> {
    const { error } = await supabase
        .from('ProductsInBoxes')
        .delete()
        .eq('boxId', boxId)
        .eq('productId', productId);

    if (error) throw new Error(error.message);
}
