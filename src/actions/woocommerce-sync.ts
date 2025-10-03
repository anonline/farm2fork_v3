import type { IProductItem } from 'src/types/product';
import type { ICategoryItem } from 'src/types/category';
import type { IProducerItem } from 'src/types/producer';

import { wpOrderToSupabaseOrder } from 'src/utils/wporder';

import { supabase } from 'src/lib/supabase';

import { insertCategory, updateCategory } from './category';
import { insertProducer, updateProducer } from './producer';
import { insertOrder, getOrderById } from './order-management';
import { createProduct, updateProduct, updateProductCategoryRelations } from './product';

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

// Helper function to extract meta value by key (for producers - object format)
function getMetaValue(metaData: Record<string, string>, key: string): string {
    return metaData[key] || '';
}

// Helper function to extract meta value by key (for products - array format)
function getProductMetaValue(metaData: Array<{id: number; key: string; value: any}>, key: string): string {
    const meta = metaData.find(item => item.key === key);
    return meta ? String(meta.value) : '';
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
        const producerDisplayName = wooProducer.title; // Initialize with default
        
        try {
            // Extract data from meta fields first
            const location = getMetaValue(wooProducer.meta_data, 'telephely');
            const shortDescription = getMetaValue(wooProducer.meta_data, 'felso_bemutatkozas') || getMetaValue(wooProducer.meta_data, 'rovid_bemutatkozas');
            const producingTags = getMetaValue(wooProducer.meta_data, 'termeny') || getMetaValue(wooProducer.meta_data, 'termeny_kartya');
            const bioValue = getMetaValue(wooProducer.meta_data, 'bio') || getMetaValue(wooProducer.meta_data, '_bio');
            const companyName = getMetaValue(wooProducer.meta_data, 'nev');
            //const producerName = wooProducer.title;
            
            // Note: Additional fields available but not used yet:
            // const startedYear = getMetaValue(wooProducer.meta_data, 'ev');
            // const avatarImageId = getMetaValue(wooProducer.meta_data, 'avatar_kep');
            // const coverImageId = getMetaValue(wooProducer.meta_data, 'boritokep');

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
                galleryIds: [], // Initialize as empty array
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

// WooCommerce Product Interface
interface WooProduct {
    id: number;
    name: string;
    slug: string;
    status: string;
    featured: boolean;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    stock_quantity: number | null;
    stock_status: string;
    manage_stock: boolean;
    backorders: string;
    tax_status: string;
    tax_class: string;
    short_description: string;
    description: string;
    categories: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
    images: Array<{
        id: number;
        src: string;
        name: string;
        alt: string;
    }>;
    meta_data: Array<{
        id: number;
        key: string;
        value: string | number | any;
    }>;
}

// Helper function to convert WooCommerce price to number
function parsePrice(price: string): number {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
}

// Helper function to map unit from WooCommerce to our system
function mapUnit(wooUnit: string): string {
    const unitMap: Record<string, string> = {
        'box': 'box',
        'kg': 'kg',
        'g': 'g',
        'l': 'l',
        'ml': 'ml',
        'db': 'db',
        'csomag': 'csomag',
        'darab': 'darab',
        'üveg': 'üveg',
        'csokor': 'csokor',
        'doboz': 'doboz',
        'köteg': 'köteg',
        'csomó': 'csomó',
        'rekesz': 'rekesz',
        'tálca': 'tálca',
        'zsák': 'zsák'
    };
    
    return unitMap[wooUnit?.toLowerCase()] || wooUnit || 'db';
}

// Synchronize WooCommerce products with our database
export async function syncProducts(
    wooProducts: WooProduct[], 
    onProgress?: SyncProgressCallback
): Promise<{ success: number; errors: number; details: string[] }> {
    const results = {
        success: 0,
        errors: 0,
        details: [] as string[]
    };

    // Get existing data from database for mapping
    const [categoriesResponse, producersResponse, productsResponse] = await Promise.all([
        supabase.from('ProductCategories').select('*'),
        supabase.from('Producers').select('*'),
        supabase.from('Products').select('*')
    ]);

    // Create lookup maps
    const categoryMap = new Map<string, ICategoryItem>();
    categoriesResponse.data?.forEach(cat => {
        categoryMap.set(cat.slug, cat);
    });

    const producerMap = new Map<string, IProducerItem>();
    producersResponse.data?.forEach(producer => {
        if (producer.id) {
            producerMap.set(producer.id.toString(), producer);
        }
    });

    const existingProductMap = new Map<string, IProductItem>();
    productsResponse.data?.forEach(product => {
        if (product.name) {
            existingProductMap.set(product.name.toLowerCase(), product);
        }
        if (product.sku) {
            existingProductMap.set(`sku:${product.sku}`, product);
        }
    });

    for (let i = 0; i < wooProducts.length; i++) {
        const wooProduct = wooProducts[i];
        
        try {
            onProgress?.(i + 1, wooProducts.length, wooProduct.name);
            
            let publish = true;
            if (wooProduct.status !== 'publish') {
                publish = false;
            }

            // Extract meta data
            const bioValue = getProductMetaValue(wooProduct.meta_data, 'bio_termek');
            const producerIdMeta = getProductMetaValue(wooProduct.meta_data, 'termelo');
            const unit = mapUnit(getProductMetaValue(wooProduct.meta_data, 'unit'));
            const usageInfo = getProductMetaValue(wooProduct.meta_data, 'felhasznalas');
            const storingInfo = getProductMetaValue(wooProduct.meta_data, 'tarolas');
            const homeFeature = getProductMetaValue(wooProduct.meta_data, 'home_featured') === '1';
            const specialInfo = getProductMetaValue(wooProduct.meta_data, 'special_info');

            // Price handling
            const netPrice = parsePrice(wooProduct.regular_price);
            const vipPrice = parsePrice(getProductMetaValue(wooProduct.meta_data, 'product_role_based_price_vsrl_-_vip'));
            const companyPrice = parsePrice(getProductMetaValue(wooProduct.meta_data, 'product_role_based_price_Company_Customer'));
            const grossPrice = parsePrice(getProductMetaValue(wooProduct.meta_data, '_gross_price') || wooProduct.price);
            const salePrice = wooProduct.sale_price ? parsePrice(wooProduct.sale_price) : null; //neet to be gross?

            // Stock handling
            const stockQuantity = wooProduct.manage_stock ? (wooProduct.stock_quantity || 0) : (wooProduct.stock_status != 'instock' ? 0 : null);
            const backorderAllowed = wooProduct.backorders !== 'no';

            // Minimum/Maximum quantity from WooCommerce Bulk Order plugin
            const minQuantity = parseFloat(getProductMetaValue(wooProduct.meta_data, '_wpbo_minimum')) || 1;
            const maxQuantity = parseFloat(getProductMetaValue(wooProduct.meta_data, '_wpbo_maximum')) || null;
            const stepQuantity = parseFloat(getProductMetaValue(wooProduct.meta_data, '_wpbo_step')) || 0.1;

            // Find producer by meta ID
            let producerId: string | null = null;
            if (producerIdMeta) {
                const producer = producerMap.get(producerIdMeta);
                if (producer) {
                    producerId = producer.id;
                } else {
                    results.details.push(`Producer not found for ID ${producerIdMeta} in product: ${wooProduct.name}`);
                }
            }

            // Find categories by slug
            const categoryIds: number[] = [];
            for (const wooCategory of wooProduct.categories) {
                const category = categoryMap.get(wooCategory.slug);
                if (category && category.id) {
                    categoryIds.push(category.id);
                } else {
                    results.details.push(`Category not found for slug "${wooCategory.slug}" in product: ${wooProduct.name}`);
                }
            }

            // Handle main product image
            let featuredImage = '';
            if (wooProduct.images && wooProduct.images.length > 0) {
                try {
                    const mainImage = wooProduct.images[0];
                    const filename = extractFilenameFromUrl(mainImage.src);

                    featuredImage = await uploadImageFromUrl(
                        mainImage.src, 
                        'product', 
                        `${filename}`
                    );
                } catch (imageError) {
                    console.error(`Failed to upload main image for product ${wooProduct.name}:`, imageError);
                    results.details.push(`Main image upload failed for ${wooProduct.name}: ${imageError}`);
                }
            }

            // Handle additional images
            const additionalImages: string[] = [];
            if (wooProduct.images && wooProduct.images.length > 1) {
                for (let imgIndex = 1; imgIndex < wooProduct.images.length; imgIndex++) {
                    try {
                        const image = wooProduct.images[imgIndex];
                        const filename = extractFilenameFromUrl(image.src);
                        const uploadedUrl = await uploadImageFromUrl(
                            image.src, 
                            'product', 
                            `${filename}`
                        );
                        additionalImages.push(uploadedUrl);
                    } catch (imageError) {
                        console.error(`Failed to upload additional image ${imgIndex} for product ${wooProduct.name}:`, imageError);
                        results.details.push(`Additional image ${imgIndex} upload failed for ${wooProduct.name}: ${imageError}`);
                    }
                }
            }

            // Prepare product data
            const productData: Partial<IProductItem> & { categoryIds?: number[] } = {
                name: wooProduct.name,
                sku: wooProduct.sku || `woo-${wooProduct.id}`,
                shortDescription: wooProduct.short_description || '',
                bio: bioValue === '1',
                //featuredImage,
                producerId: producerId || undefined,
                unit,
                stepQuantity,
                mininumQuantity: minQuantity,
                maximumQuantity: maxQuantity || undefined,
                stock: stockQuantity,
                backorder: backorderAllowed,
                usageInformation: usageInfo || '',
                storingInformation: storingInfo || '',
                //images: additionalImages,
                publish: publish || false,
                netPrice,
                netPriceVIP: vipPrice || netPrice,
                netPriceCompany: companyPrice || netPrice,
                grossPrice,
                salegrossPrice: salePrice,
                featured: homeFeature || false,
                star: wooProduct.featured || false, // Could be mapped from meta if needed
                vat: wooProduct.tax_status == "taxable" ? parseInt(wooProduct.tax_class) || 27 : 0, // Default VAT, could be extracted from tax settings
                cardText: specialInfo,
                url: wooProduct.slug,
                // Add categoryIds for the relationship handling
                categoryIds
            };

            // Check if product exists (by name or SKU)
            const existingProduct = existingProductMap.get(wooProduct.name.toLowerCase()) || 
                                  existingProductMap.get(`sku:${wooProduct.sku}`);

            if (existingProduct) {
                // Check if update is needed
                const needsUpdate = 
                    existingProduct.sku !== productData.sku ||
                    existingProduct.shortDescription !== productData.shortDescription ||
                    existingProduct.bio !== productData.bio ||
                    existingProduct.producerId !== productData.producerId ||
                    existingProduct.unit !== productData.unit ||
                    existingProduct.stock !== productData.stock ||
                    existingProduct.netPrice !== productData.netPrice ||
                    existingProduct.grossPrice !== productData.grossPrice ||
                    featuredImage; // Always update if we have a new image

                if (needsUpdate) {
                    await updateProduct(existingProduct.id, productData);
                    results.details.push(`Updated product: ${wooProduct.name}`);
                } else {
                    // Still update category relationships
                    if (categoryIds.length > 0) {
                        await updateProductCategoryRelations(existingProduct.id, categoryIds);
                    }
                    results.details.push(`No changes needed for product: ${wooProduct.name}`);
                }
            } else {
                // Create new product
                await createProduct(productData);
                results.details.push(`Created new product: ${wooProduct.name}`);
            }

            results.success++;
        } catch (error) {
            console.error(`Error syncing product ${wooProduct.name}:`, error);
            results.errors++;
            results.details.push(`Error syncing ${wooProduct.name}: ${error}`);
        }
    }

    return results;
}

// Synchronize WooCommerce orders with our database
export async function syncOrders(
    wooOrders: any[], 
    onProgress?: SyncProgressCallback
): Promise<{ success: number; errors: number; skipped: number; details: string[] }> {
    const results = {
        success: 0,
        errors: 0,
        skipped: 0,
        details: [] as string[]
    };

    for (let i = 0; i < wooOrders.length; i++) {
        const wooOrder = wooOrders[i];
        const orderId = wooOrder.id?.toString();
        
        try {
            onProgress?.(i + 1, wooOrders.length, `Order #${orderId || 'Unknown'}`);
            
            if (!orderId) {
                results.errors++;
                results.details.push(`Order missing ID, skipped`);
                continue;
            }

            // Check if order already exists
            const { order: existingOrder } = await getOrderById(orderId);
            
            if (existingOrder) {
                results.skipped++;
                results.details.push(`Order #${orderId} already exists, skipped`);
                continue;
            }

            // Convert WP order to Supabase order format
            const orderData = await wpOrderToSupabaseOrder(wooOrder);

            const productIds = orderData.items?.map((item: any) => item.product_id).filter((id: number) => !!id) || [];
            
            if (productIds.length > 0) {
                // Fetch product data for the line items
                const products = await getProductsByIds(productIds);
                const productMap = new Map<number, {id: number; url: string; featuredImage: string}>();
                products?.forEach(prod => {
                    if (prod.id) {
                        productMap.set(prod.id, prod);
                    }
                });

                orderData.items = orderData.items.map((item: any) => {
                    const product = productMap.get(item.product_id);
                    if (product) {
                        item.coverUrl = product.featuredImage || '';
                        item.slug = product.url || '';
                    }

                    return item;
                });
            }
            
            // Create the order
            const { orderId: createdOrderId, error } = await insertOrder(orderData);
            
            if (error || !createdOrderId) {
                results.errors++;
                results.details.push(`Failed to create order #${orderId}: ${error}`);
            } else {
                results.success++;
                results.details.push(`Created order #${orderId}`);
            }
        } catch (error) {
            console.error(`Error syncing order #${orderId}:`, error);
            results.errors++;
            results.details.push(`Error syncing order #${orderId}: ${error}`);
        }
    }

    return results;
}

async function getProductsByIds(productIds: number[]) : Promise<{id: number; url: string; featuredImage: string}[] | null> {
    const {data:productsData} = await supabase.from('Products').select('id, url, featuredImage').in('id', productIds);
    return productsData as {id: number; url: string; featuredImage: string}[] | null;
}

