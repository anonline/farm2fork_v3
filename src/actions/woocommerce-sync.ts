import type { ICategoryItem } from 'src/types/category';
import type { IProducerItem } from 'src/types/producer';

import { supabase } from 'src/lib/supabase';

import { insertCategory, updateCategory } from './category';
import { insertProducer, updateProducer } from './producer';

// Helper function to upload image from URL to Vercel Blob via API
export async function uploadImageFromUrl(imageUrl: string, folder: 'category' | 'product' | 'assets' | 'news', filename: string) {
    try {
        // Use our server-side API to download and upload the image (bypasses CORS)
        const uploadResponse = await fetch('/api/img/upload-from-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl,
                folder,
                filename
            }),
        });
        
        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Upload failed: ${errorData.error || uploadResponse.statusText}`);
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

// WooCommerce Producer Interface
interface WooProducer {
    id: number;
    title: string;
    slug: string;
    featured_img: string;
    content: string;
    post: any; // WP_Post object
    link: string;
    meta_data: Record<string, string>; // Changed from array to object
}

// Helper function to extract meta value by key
function getMetaValue(metaData: Record<string, string>, key: string): string {
    return metaData[key] || '';
}

// Synchronize WooCommerce producers with our database
export async function syncProducers(
    wooProducers: WooProducer[], 
    onProgress?: SyncProgressCallback
): Promise<{ success: number; errors: number; details: string[] }> {
    const results = {
        success: 0,
        errors: 0,
        details: [] as string[]
    };

    // Get existing producers from database
    const { data: existingProducers } = await supabase
        .from('Producers')
        .select('*');

    const existingProducerMap = new Map<string, IProducerItem>();
    existingProducers?.forEach(producer => {
        existingProducerMap.set(producer.name.toLowerCase(), producer);
    });

    for (let i = 0; i < wooProducers.length; i++) {
        const wooProducer = wooProducers[i];
        let producerDisplayName = wooProducer.title; // Initialize with default
        
        try {
            // Extract data from meta fields first
            const location = getMetaValue(wooProducer.meta_data, 'telephely');
            const shortDescription = getMetaValue(wooProducer.meta_data, 'felso_bemutatkozas') || getMetaValue(wooProducer.meta_data, 'rovid_bemutatkozas');
            const producingTags = getMetaValue(wooProducer.meta_data, 'termeny') || getMetaValue(wooProducer.meta_data, 'termeny_kartya');
            const bioValue = getMetaValue(wooProducer.meta_data, 'bio') || getMetaValue(wooProducer.meta_data, '_bio');
            const companyName = getMetaValue(wooProducer.meta_data, 'cegnev');
            const producerName = getMetaValue(wooProducer.meta_data, 'nev');
            // Note: Additional fields available but not used yet:
            // const startedYear = getMetaValue(wooProducer.meta_data, 'ev');
            // const avatarImageId = getMetaValue(wooProducer.meta_data, 'avatar_kep');
            // const coverImageId = getMetaValue(wooProducer.meta_data, 'boritokep');

            producerDisplayName = producerName || wooProducer.title;
            onProgress?.(i + 1, wooProducers.length, producerDisplayName);
            
            const existingProducer = existingProducerMap.get(producerDisplayName.toLowerCase());

            // Prepare producer data
            const producerData: Partial<IProducerItem> = {
                name: producerDisplayName, // Use the correctly determined name
                slug: wooProducer.slug,
                location: location || '',
                shortDescription: shortDescription ? shortDescription.replace(/<[^>]*>/g, '') : '', // Strip HTML tags
                producingTags: producingTags || '',
                companyName: companyName || '',
                bio: bioValue === '1' || bioValue === 'true',
                galleryIds: [] // Initialize as empty array
            };

            // Handle featured image upload if present
            if (wooProducer.featured_img) {
                try {
                    const filename = extractFilenameFromUrl(wooProducer.featured_img);
                    const uploadedImageUrl = await uploadImageFromUrl(
                        wooProducer.featured_img, 
                        'assets', 
                        `woo-producer-${wooProducer.id}-${filename}`
                    );
                    producerData.featuredImage = uploadedImageUrl;
                } catch (imageError) {
                    console.error(`Failed to upload image for producer ${wooProducer.title}:`, imageError);
                    results.details.push(`Image upload failed for ${wooProducer.title}: ${imageError}`);
                    // Continue without image
                }
            }

            if (existingProducer) {
                // Check if update is needed
                const needsUpdate = 
                    existingProducer.slug !== wooProducer.slug ||
                    existingProducer.location !== (location || '') ||
                    existingProducer.shortDescription !== (shortDescription ? shortDescription.replace(/<[^>]*>/g, '') : '') ||
                    existingProducer.producingTags !== (producingTags || '') ||
                    existingProducer.companyName !== (companyName || '') ||
                    existingProducer.bio !== (bioValue === '1' || bioValue === 'true') ||
                    wooProducer.featured_img; // Always update image if provided

                if (needsUpdate) {
                    await updateProducer(existingProducer.id, producerData);
                    results.details.push(`Updated producer: ${producerDisplayName}`);
                } else {
                    results.details.push(`No changes needed for producer: ${producerDisplayName}`);
                }
            } else {
                // Create new producer
                await insertProducer(producerData);
                results.details.push(`Created new producer: ${producerDisplayName}`);
            }

            results.success++;
        } catch (error) {
            console.error(`Error syncing producer ${producerDisplayName}:`, error);
            results.errors++;
            results.details.push(`Error syncing ${producerDisplayName}: ${error}`);
        }
    }

    return results;
}
