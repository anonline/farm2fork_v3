import type { ICategoryItem } from 'src/types/category';

import { supabase } from 'src/lib/supabase';
import { insertCategory, updateCategory } from './category';

// Helper function to upload image from URL to Vercel Blob
export async function uploadImageFromUrl(imageUrl: string, folder: 'category' | 'product' | 'assets' | 'news', filename: string) {
    try {
        // Fetch the image from the URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        // Get the blob and create a stream
        const blob = await response.blob();
        const stream = blob.stream();
        
        // Upload to our API endpoint
        const uploadResponse = await fetch(`/api/img/upload?folder=${folder}&filename=${filename}`, {
            method: 'POST',
            body: stream,
            headers: {
                'Content-Type': blob.type,
            },
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        return result.url;
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        throw error;
    }
}

// Helper function to extract filename from WooCommerce image URL
export function extractFilenameFromUrl(url: string): string {
    try {
        const urlPath = new URL(url).pathname;
        const filename = urlPath.split('/').pop() || 'image.jpg';
        return filename;
    } catch {
        return 'image.jpg';
    }
}

// WooCommerce Category Interface
interface WooCategory {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    display: string;
    image?: {
        id: number;
        src: string;
        name: string;
        alt: string;
    };
    menu_order: number;
    count: number;
}

// Progress callback type
export type SyncProgressCallback = (processed: number, total: number, currentItem: string) => void;

// Synchronize WooCommerce categories with our database
export async function syncCategories(
    wooCategories: WooCategory[], 
    onProgress?: SyncProgressCallback
): Promise<{ success: number; errors: number; details: string[] }> {
    const results = {
        success: 0,
        errors: 0,
        details: [] as string[]
    };

    // Get existing categories from database
    const { data: existingCategories } = await supabase
        .from('ProductCategories')
        .select('*');

    const existingCategoryMap = new Map<string, ICategoryItem>();
    existingCategories?.forEach(cat => {
        existingCategoryMap.set(cat.name.toLowerCase(), cat);
    });

    // Process categories in two passes to handle parent relationships
    // First pass: Create/update categories without parent relationships
    for (let i = 0; i < wooCategories.length; i++) {
        const wooCategory = wooCategories[i];
        
        try {
            onProgress?.(i + 1, wooCategories.length, wooCategory.name);
            
            const existingCategory = existingCategoryMap.get(wooCategory.name.toLowerCase());
            
            // Prepare category data
            const categoryData: Partial<ICategoryItem> = {
                name: wooCategory.name,
                slug: wooCategory.slug,
                description: wooCategory.description || '',
                order: wooCategory.menu_order || 0,
                enabled: true,
                showHome: false,
                usageInformation: '',
                storingInformation: '',
                showProductPage: false
            };

            // Handle image upload if present
            if (wooCategory.image?.src) {
                try {
                    const filename = extractFilenameFromUrl(wooCategory.image.src);
                    const uploadedImageUrl = await uploadImageFromUrl(
                        wooCategory.image.src, 
                        'category', 
                        `woo-${wooCategory.id}-${filename}`
                    );
                    categoryData.coverUrl = uploadedImageUrl;
                } catch (imageError) {
                    console.error(`Failed to upload image for category ${wooCategory.name}:`, imageError);
                    results.details.push(`Image upload failed for ${wooCategory.name}: ${imageError}`);
                    // Continue without image
                }
            }

            if (existingCategory) {
                // Check if update is needed
                const needsUpdate = 
                    existingCategory.slug !== wooCategory.slug ||
                    existingCategory.description !== (wooCategory.description || '') ||
                    existingCategory.order !== (wooCategory.menu_order || 0) ||
                    wooCategory.image?.src; // Always update image if provided

                if (needsUpdate) {
                    categoryData.id = existingCategory.id;
                    await updateCategory(categoryData);
                    results.details.push(`Updated category: ${wooCategory.name}`);
                } else {
                    results.details.push(`No changes needed for category: ${wooCategory.name}`);
                }
            } else {
                // Create new category
                await insertCategory(categoryData);
                results.details.push(`Created new category: ${wooCategory.name}`);
            }

            results.success++;
        } catch (error) {
            console.error(`Error syncing category ${wooCategory.name}:`, error);
            results.errors++;
            results.details.push(`Error syncing ${wooCategory.name}: ${error}`);
        }
    }

    // Second pass: Update parent relationships
    // We need fresh data after inserts/updates
    const { data: updatedCategories } = await supabase
        .from('ProductCategories')
        .select('*');

    const updatedCategoryMap = new Map<string, ICategoryItem>();
    updatedCategories?.forEach(cat => {
        updatedCategoryMap.set(cat.name.toLowerCase(), cat);
    });

    // Create a map of WooCommerce ID to name for parent lookup
    const wooIdToNameMap = new Map<number, string>();
    wooCategories.forEach(cat => {
        wooIdToNameMap.set(cat.id, cat.name);
    });

    for (const wooCategory of wooCategories) {
        if (wooCategory.parent && wooCategory.parent > 0) {
            try {
                const childCategory = updatedCategoryMap.get(wooCategory.name.toLowerCase());
                const parentName = wooIdToNameMap.get(wooCategory.parent);
                const parentCategory = parentName ? updatedCategoryMap.get(parentName.toLowerCase()) : null;

                if (childCategory && parentCategory && childCategory.parentId !== parentCategory.id) {
                    await updateCategory({
                        id: childCategory.id,
                        parentId: parentCategory.id
                    });
                    results.details.push(`Updated parent relationship: ${wooCategory.name} -> ${parentCategory.name}`);
                }
            } catch (error) {
                console.error(`Error updating parent relationship for ${wooCategory.name}:`, error);
                results.details.push(`Error updating parent for ${wooCategory.name}: ${error}`);
            }
        }
    }

    return results;
}
