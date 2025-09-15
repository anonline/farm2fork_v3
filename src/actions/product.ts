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
export async function fetchGetProductsByIds(productIds: number[]): Promise<{ products: IProductItem[]; error: string | null }> {
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

        return { products: data as IProductItem[] || [], error: null };
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

export async function updateProduct(id: number, productData: Partial<IProductItem>) {
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

export async function updateProductCategoryRelations(productId: number, categoryIds: number[]) {
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