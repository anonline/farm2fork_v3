import type { ICategoryItem } from 'src/types/category';
import type { IProductItem } from 'src/types/product';

/**
 * Sort categories by custom order array
 * Categories not in the order array will appear at the end, sorted by name
 * 
 * @param categories - Array of categories to sort
 * @param categoryOrder - Array of category IDs in desired order
 * @returns Sorted array of categories
 */
export function sortCategoriesByCustomOrder(
    categories: ICategoryItem[],
    categoryOrder: number[]
): ICategoryItem[] {
    if (!categoryOrder || categoryOrder.length === 0) {
        // If no custom order, sort alphabetically by name
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Create a map of category ID to its position in the custom order
    const orderMap = new Map<number, number>();
    categoryOrder.forEach((id, index) => {
        orderMap.set(id, index);
    });

    return [...categories].sort((a, b) => {
        const orderA = a.id !== null ? orderMap.get(a.id) : undefined;
        const orderB = b.id !== null ? orderMap.get(b.id) : undefined;

        // If both have custom order positions
        if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB;
        }

        // If only A has custom order, A comes first
        if (orderA !== undefined) {
            return -1;
        }

        // If only B has custom order, B comes first
        if (orderB !== undefined) {
            return 1;
        }

        // Neither has custom order, sort alphabetically
        return a.name.localeCompare(b.name);
    });
}

/**
 * Sort products by their categories' custom order
 * Products are sorted based on their first category's position in the order array
 * Products without categories or with unordered categories appear at the end
 * 
 * @param products - Array of products to sort
 * @param categoryOrder - Array of category IDs in desired order
 * @param categoryConnections - Optional array of product-category connections
 * @returns Sorted array of products
 */
export function sortProductsByCategoryOrder(
    products: IProductItem[],
    categoryOrder: number[],
    categoryConnections?: Array<{ productId: number; categoryId: number }>
): IProductItem[] {
    if (!categoryOrder || categoryOrder.length === 0) {
        return products;
    }

    // Create a map of product ID to its categories
    const productCategoryMap = new Map<string, number[]>();
    
    if (categoryConnections) {
        categoryConnections.forEach((conn) => {
            const productId = conn.productId.toString();
            if (!productCategoryMap.has(productId)) {
                productCategoryMap.set(productId, []);
            }
            productCategoryMap.get(productId)!.push(conn.categoryId);
        });
    }

    // Create buckets for each category in the order (excluding 42 which is special fallback)
    const buckets = new Map<number, IProductItem[]>();
    
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

    // Place each product in the bucket of its highest position category
    products.forEach(product => {
        // Convert product.id to string for Map lookup (handles both string and number types)
        const productIdKey = product.id ? String(product.id) : '';
        const productCategories = productCategoryMap.get(productIdKey) || [];
        
        if (productCategories.length === 0) {
            // No categories, put in bucket 42
            buckets.get(42)!.push(product);
            return;
        }

        // Find the highest position (most specific) category that exists in our order
        const orderedPositions = productCategories
            .map(catId => ({ catId, position: orderMap.get(catId) }))
            .filter(({ position }) => position !== undefined)
            .sort((a, b) => b.position! - a.position!); // Sort descending to get highest position

        if (orderedPositions.length === 0) {
            // Product has categories but none are in the order, put in bucket 42
            buckets.get(42)!.push(product);
            return;
        }

        // Use the highest position category
        const targetCategory = orderedPositions[0].catId;
        buckets.get(targetCategory)!.push(product);
    });

    // Sort products alphabetically within each bucket and concatenate
    const result: IProductItem[] = [];
    
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

/**
 * Get top-level categories only (categories without parents)
 * 
 * @param categories - Array of all categories
 * @returns Array of top-level categories
 */
export function getTopLevelCategories(categories: ICategoryItem[]): ICategoryItem[] {
    return categories.filter((cat) => !cat.parentId);
}

/**
 * Get child categories for a specific parent category
 * 
 * @param categories - Array of all categories
 * @param parentId - ID of the parent category
 * @returns Array of child categories
 */
export function getChildCategories(categories: ICategoryItem[], parentId: number): ICategoryItem[] {
    return categories.filter((cat) => cat.parentId === parentId);
}
