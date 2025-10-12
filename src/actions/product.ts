import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';
import { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ProductsData = {
    products: IProductItem[];
};

export function useGetProducts() {
    const { data, isLoading, error, isValidating } = useSWR<ProductsData>('products', async () => {
        const response = await supabase
            .from('Products')
            .select('*, ProductCategories_Products(ProductCategories(*))');

        const { data: products, error: responseError } = response;

        if (responseError) throw responseError.message;
        return { products };
    });

    const memoizedValue = useMemo(
        () => ({
            products: data?.products || [],
            productsLoading: isLoading,
            productsError: error,
            productsValidating: isValidating,
            productsEmpty: !isLoading && !isValidating && !data?.products.length,
        }),
        [data?.products, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type ProductData = {
    product: IProductItem;
};

export function useGetProduct(productId: string) {
    const url = productId ? [endpoints.product.details, { params: { productId } }] : '';

    const { data, isLoading, error, isValidating } = useSWR<ProductData>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(
        () => ({
            product: data?.product,
            productLoading: isLoading,
            productError: error,
            productValidating: isValidating,
        }),
        [data?.product, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export async function fetchGetProductBySlug(slug: string) {
    const response = await supabase
        .from('Products')
        .select('*, ProductCategories_Products(ProductCategories(*))')
        .eq('url', slug)
        .maybeSingle();

    const { data, error: responseError } = response;

    if (responseError) throw responseError.message;
    return { product: data as IProductItem | null };
}

/**
 * Fetch multiple products by their IDs
 */
export async function fetchGetProductsByIds(productIds: string[]): Promise<{ products: IProductItem[]; error: string | null }> {
    try {
        if (!productIds.length) {
            return { products: [], error: null };
        }

        const response = await supabase
            .from('Products')
            .select('*, ProductCategories_Products(ProductCategories(*))')
            .in('id', productIds);
        
        const { data, error: responseError } = response;

        if (responseError) {
            console.error('Error fetching products by IDs:', responseError);
            return { products: [], error: responseError.message };
        }

        let products = data as IProductItem[] || [];
        // Fetch bundle items for bundle products
        const bundleProductIds = products
            .filter(product => product.type === 'bundle')
            .map(product => product.id.toString());
        
        if (bundleProductIds.length > 0) {
            const { data: bundleData, error: bundleError } = await supabase
                .from('ProductsInBoxes')
                .select('boxId, productId, qty, product:Products!ProductsInBoxes_productId_fkey(*)')
                .in('boxId', bundleProductIds);
            
            if (bundleError) {
                console.error('Error fetching bundle items:', bundleError);
            } else if (bundleData) {
                const bundleItemsMap = new Map<string, any[]>();

                bundleData.forEach((item: any) => {
                    const boxId = item.boxId.toString();

                    if (!bundleItemsMap.has(boxId)) {
                        bundleItemsMap.set(boxId, []);
                    }

                    bundleItemsMap.get(boxId)!.push({
                        productId: item.productId.toString(),
                        qty: item.qty,
                        product: item.product,
                    });
                });
                products = products.map(product => {
                    if (product.type === 'bundle' && bundleItemsMap.has(product.id.toString())) {
                        product.bundleItems = bundleItemsMap.get(product.id.toString());
                    }
                    return product;
                });
            }
        }

        return { products, error: null };
    } catch (error) {
        console.error('Error fetching products by IDs:', error);
        return { products: [], error: 'Failed to fetch products' };
    }
}

// ----------------------------------------------------------------------

export function useSearchProducts(query: string) {
    const url = query ? [endpoints.product.search, { params: { q: query } }] : '';

    const { data, isLoading, error, isValidating } = useSWR<IProductItem[]>(url, fetcher, {
        ...swrOptions,
        keepPreviousData: true,
    });

    const memoizedValue = useMemo(
        () => ({
            searchResults: data || [],
            searchLoading: isLoading,
            searchError: error,
            searchValidating: isValidating,
            searchEmpty: !isLoading && !isValidating && !data?.length,
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchProductsAdmin(query: string) {
    const url = query ? [endpoints.product.adminSearch, { params: { q: query } }] : '';
    console.log('Admin search URL:', url);
    const { data, isLoading, error, isValidating } = useSWR<IProductItem[]>(url, fetcher, {
        ...swrOptions,
        keepPreviousData: true,
    });

    const memoizedValue = useMemo(
        () => ({
            searchResults: data || [],
            searchLoading: isLoading,
            searchError: error,
            searchValidating: isValidating,
            searchEmpty: !isLoading && !isValidating && !data?.length,
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createProduct(productData: Partial<IProductItem>) {
    const { categoryIds, ...restProductData } = productData as any;

    const { data: newProduct, error } = await supabase
        .from('Products')
        .insert(restProductData)
        .select()
        .single();

    if (error) {
        console.error('Supabase create error:', error);
        throw new Error(`Hiba a termék létrehozása során: ${error.message}`);
    }

    if (categoryIds && categoryIds.length > 0) {
        await updateProductCategoryRelations(newProduct.id, categoryIds);
    }

    return newProduct;
}

export async function updateProduct(id: string, productData: Partial<IProductItem>) {
    const { categoryIds, ...restProductData } = productData as any;

    // Check if featured image has changed and delete old one if needed
    if (restProductData.featured_image) {
        const { data: currentProduct, error: fetchError } = await supabase
            .from('Products')
            .select('featuredImage')
            .eq('id', id)
            .single();

        if (!fetchError && currentProduct?.featuredImage && currentProduct.featuredImage !== restProductData.featuredImage) {
            try {
                // Delete the old image using our API endpoint
                const response = await fetch('/api/img/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: currentProduct.featuredImage
                    })
                });

                if (!response.ok) {
                    console.error(`Failed to delete image: ${response.statusText}`);
                }
            } catch (deleteError) {
                console.warn('Failed to fetch old featured image:', deleteError);
                // Don't throw here - we still want to update the product even if blob deletion fails
            }
        }
    }

    const { error } = await supabase.from('Products').update(restProductData).eq('id', id);
    if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Hiba a termék frissítése során: ${error.message}`);
    }

    if (categoryIds) {
        await updateProductCategoryRelations(id, categoryIds);
    }

    return { success: true };
}

export async function updateProductCategoryRelations(productId: string, categoryIds: number[]) {
    const { error: deleteError } = await supabase
        .from('ProductCategories_Products')
        .delete()
        .eq('productId', productId);

    if (deleteError) {
        console.error('Supabase relation delete error:', deleteError);
        throw new Error(`Hiba a kategória kapcsolatok törlése során: ${deleteError.message}`);
    }

    if (categoryIds && categoryIds.length > 0) {
        const newRelations = categoryIds.map((categoryId) => ({
            productId,
            categoryId,
        }));

        const { error: insertError } = await supabase
            .from('ProductCategories_Products')
            .insert(newRelations);

        if (insertError) {
            console.error('Supabase relation insert error:', insertError);
            throw new Error(`Hiba a kategória kapcsolatok mentése során: ${insertError.message}`);
        }
    }

    return { success: true };
}

// ----------------------------------------------------------------------

export async function deleteProduct(id: string) {
    // First, get the product to access its featured image
    const { data: product, error: fetchError } = await supabase
        .from('Products')
        .select('featuredImage')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching product for deletion:', fetchError);
        throw new Error(`Hiba a termék lekérdezése során: ${fetchError.message}`);
    }

    // Delete featured image if it exists
    if (product?.featuredImage) {
        try {
            const response = await fetch('/api/img/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: product.featuredImage
                })
            });

            if (!response.ok) {
                console.warn(`Failed to delete image: ${response.statusText}`);
                // Continue with product deletion even if image deletion fails
            }
        } catch (deleteError) {
            console.warn('Failed to delete featured image:', deleteError);
            // Continue with product deletion even if image deletion fails
        }
    }

    // Delete category relations first (due to foreign key constraints)
    const { error: relationError } = await supabase
        .from('ProductCategories_Products')
        .delete()
        .eq('productId', id);

    if (relationError) {
        console.error('Error deleting product category relations:', relationError);
        throw new Error(`Hiba a kategória kapcsolatok törlése során: ${relationError.message}`);
    }

    // Delete bundle relations if this is a bundle product
    const { error: bundleError } = await supabase
        .from('ProductsInBoxes')
        .delete()
        .eq('boxId', id);

    if (bundleError) {
        console.error('Error deleting bundle relations:', bundleError);
        // Not throwing here as the product might not be a bundle
    }

    // Finally, delete the product itself
    const { error: deleteError } = await supabase
        .from('Products')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error('Error deleting product:', deleteError);
        throw new Error(`Hiba a termék törlése során: ${deleteError.message}`);
    }

    return { success: true };
}

export async function deleteProducts(ids: string[]) {
    const results = await Promise.allSettled(
        ids.map(id => deleteProduct(id))
    );

    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

    if (errors.length > 0) {
        console.error('Some products failed to delete:', errors);
        throw new Error(`${errors.length} termék törlése sikertelen volt`);
    }

    return { success: true, deletedCount: ids.length };
}

// ----------------------------------------------------------------------

type StockData = Array<{
    id: string;
    stock: number;
    backorder: boolean;
}>;

/**
 * Hook to fetch stock data for cart items with automatic polling
 */
export function useGetStockDataForCart(productIds: string[]) {
    const shouldFetch = productIds.length > 0;
    
    const { data, error, isLoading, isValidating, mutate } = useSWR<StockData>(
        shouldFetch ? ['cart-stock', ...productIds] : null,
        async () => {
            const { data: stockData, error: stockError } = await supabase
                .from('Products')
                .select('id, stock, backorder')
                .in('id', productIds);

            if (stockError) {
                console.error('Error fetching stock data:', stockError);
                throw new Error(`Hiba a készletadatok lekérdezése során: ${stockError.message}`);
            }

            return stockData as StockData;
        },
        {
            refreshInterval: 7000, // Poll every 7 seconds
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
        }
    );

    const memoizedValue = useMemo(
        () => ({
            stockData: data || [],
            stockLoading: isLoading,
            stockError: error,
            stockValidating: isValidating,
            refetch: mutate,
        }),
        [data, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}
