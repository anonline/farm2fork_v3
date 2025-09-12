'use client';

import type { IProductItem } from 'src/types/product';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/global-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get configuration from global config
const PRODUCTS_PER_PAGE = CONFIG.pagination.productsPerPage;

type SortingOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

export interface UseInfiniteProductsProps {
    categoryId?: number;
    isBio?: boolean;
    sorting?: SortingOption;
    searchText?: string;
}

export interface UseInfiniteProductsReturn {
    products: IProductItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    reset: () => void;
    totalCount: number;
}

export function useInfiniteProducts({
    categoryId,
    isBio = false,
    sorting = 'default',
    searchText = '',
}: UseInfiniteProductsProps = {}): UseInfiniteProductsReturn {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Build the query based on filters
    const buildQuery = useCallback((offset: number, limit: number) => {
        let query = supabase
            .from('Products')
            .select('*, producer:Producers(*), category:ProductCategories(*)', { count: 'exact' })
            .range(offset, offset + limit - 1);

        // Apply category filter (if not "all products" category id 42)
        if (categoryId !== undefined && categoryId !== 42) {
            // For category filtering, we need to join with ProductCategories_Products
            query = supabase
                .from('ProductCategories_Products')
                .select(`
                    Products!inner(
                        *,
                        producer:Producers(*),
                        category:ProductCategories(*)
                    )
                `, { count: 'exact' })
                .eq('categoryId', categoryId)
                .range(offset, offset + limit - 1);
        }

        // Apply bio filter
        if (isBio) {
            if (categoryId !== undefined && categoryId !== 42) {
                query = query.eq('Products.bio', true);
            } else {
                query = query.eq('bio', true);
            }
        }

        // Apply search filter
        if (searchText.trim()) {
            if (categoryId !== undefined && categoryId !== 42) {
                query = query.ilike('Products.name', `%${searchText}%`);
            } else {
                query = query.ilike('name', `%${searchText}%`);
            }
        }

        // Apply sorting
        if (sorting && sorting !== 'default') {
            const orderColumn = categoryId !== undefined && categoryId !== 42 ? 'Products.name' : 'name';
            const priceColumn = categoryId !== undefined && categoryId !== 42 ? 'Products.netPrice' : 'netPrice';

            switch (sorting) {
                case 'name-asc':
                    query = query.order(orderColumn, { ascending: true });
                    break;
                case 'name-desc':
                    query = query.order(orderColumn, { ascending: false });
                    break;
                case 'price-asc':
                    query = query.order(priceColumn, { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order(priceColumn, { ascending: false });
                    break;
                default:
                    query = query.order(orderColumn, { ascending: true });
                    break;
            }
        } else {
            const orderColumn = categoryId !== undefined && categoryId !== 42 ? 'Products.name' : 'name';
            query = query.order(orderColumn, { ascending: true });
        }

        return query;
    }, [categoryId, isBio, searchText, sorting]);

    // Fetch products for a specific page
    const fetchProducts = useCallback(async (page: number, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const offset = page * PRODUCTS_PER_PAGE;
            console.log(`Fetching page ${page}, offset: ${offset}, PRODUCTS_PER_PAGE: ${PRODUCTS_PER_PAGE}`);
            const query = buildQuery(offset, PRODUCTS_PER_PAGE);
            
            const { data, error: supabaseError, count } = await query;

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            let processedProducts: IProductItem[] = [];

            if (categoryId !== undefined && categoryId !== 42) {
                // Extract products from the join result
                processedProducts = (data?.map((item: any) => item.Products).filter(Boolean) as IProductItem[]) ?? [];
            } else {
                processedProducts = (data as IProductItem[]) ?? [];
            }

            console.log(`Received ${processedProducts.length} products, total count: ${count}, reset: ${reset}`);

            if (reset) {
                setProducts(processedProducts);
                setCurrentPage(0);
                setTotalCount(count ?? 0);
                setHasMore(processedProducts.length === PRODUCTS_PER_PAGE && processedProducts.length < (count ?? 0));
            } else {
                // Deduplicate products by ID to avoid React key conflicts
                let updatedProducts: IProductItem[] = [];
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProducts = processedProducts.filter(p => !existingIds.has(p.id));
                    updatedProducts = [...prev, ...newProducts];
                    return updatedProducts;
                });
                
                setTotalCount(count ?? 0);
                // Check if we got a full page and if there are more products to load
                const newHasMore = processedProducts.length === PRODUCTS_PER_PAGE && (offset + PRODUCTS_PER_PAGE) < (count ?? 0);
                console.log(`Setting hasMore to ${newHasMore}: processedProducts.length=${processedProducts.length}, PRODUCTS_PER_PAGE=${PRODUCTS_PER_PAGE}, offset=${offset}, count=${count}`);
                setHasMore(newHasMore);
            }
            
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Hiba történt a termékek betöltése során');
            if (reset) {
                setProducts([]);
                setTotalCount(0);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [buildQuery]);

    // Load more products
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = currentPage + 1;
            console.log(`Loading page ${nextPage}, current products: ${products.length}, hasMore: ${hasMore}`);
            setCurrentPage(nextPage);
            fetchProducts(nextPage, false);
        }
    }, [currentPage, fetchProducts, hasMore, loadingMore, products.length]);

    // Reset and reload from beginning
    const reset = useCallback(() => {
        setCurrentPage(0);
        setHasMore(true);
        fetchProducts(0, true);
    }, [fetchProducts]);

    // Effect to reload products when filters change
    useEffect(() => {
        setCurrentPage(0);
        setHasMore(true);
        fetchProducts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId, isBio, sorting, searchText]);

    return {
        products,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        reset,
        totalCount,
    };
}

export { PRODUCTS_PER_PAGE };
