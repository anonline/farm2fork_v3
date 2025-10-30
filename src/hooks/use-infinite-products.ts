'use client';

import type { IProductItem } from 'src/types/product';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/global-config';

import { useAuthContext } from 'src/auth/hooks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get configuration from global config
const PRODUCTS_PER_PAGE = CONFIG.pagination.productsPerPage;

type SortingOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

/**
 * Generate all accent variations for Hungarian search text
 * Example: "körte" -> ["körte", "korte"]
 * Example: "áfónya" -> ["áfónya", "afónya", "áfonya", "afonya"]
 */
function generateAccentVariations(text: string): string[] {
    // Hungarian accent mappings (bidirectional)
    const accentMap: Record<string, string[]> = {
        'a': ['a', 'á'],
        'á': ['a', 'á'],
        'e': ['e', 'é'],
        'é': ['e', 'é'],
        'i': ['i', 'í'],
        'í': ['i', 'í'],
        'o': ['o', 'ó', 'ö', 'ő'],
        'ó': ['o', 'ó', 'ö', 'ő'],
        'ö': ['o', 'ó', 'ö', 'ő'],
        'ő': ['o', 'ó', 'ö', 'ő'],
        'u': ['u', 'ú', 'ü', 'ű'],
        'ú': ['u', 'ú', 'ü', 'ű'],
        'ü': ['u', 'ú', 'ü', 'ű'],
        'ű': ['u', 'ú', 'ü', 'ű'],
    };

    const chars = text.toLowerCase().split('');
    const positions: string[][] = chars.map(char => accentMap[char] || [char]);

    // Generate all combinations
    function generateCombinations(arrays: string[][]): string[] {
        if (arrays.length === 0) return [''];
        if (arrays.length === 1) return arrays[0];

        const result: string[] = [];
        const first = arrays[0];
        const rest = generateCombinations(arrays.slice(1));

        for (const item of first) {
            for (const combination of rest) {
                result.push(item + combination);
            }
        }

        return result;
    }

    const variations = generateCombinations(positions);
    
    // Remove duplicates and limit to prevent too many variations
    const unique = Array.from(new Set(variations));
    
    // Limit to 8 variations for performance (should be enough for most cases)
    return unique.slice(0, 8);
}

export interface UseInfiniteProductsProps {
    categoryId?: number;
    subCategoryIds?: number[];
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
    subCategoryIds = [],
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

    const {user} = useAuthContext(); 
    const [isVIP, setIsVIP] = useState(false);
    const [isCORP, setIsCORP] = useState(false);

    useEffect(() => {
        setIsVIP(user?.user_metadata?.is_vip || false);
        setIsCORP(user?.user_metadata?.is_corp || false);
    }, [user]);
    
    // Build the query based on filters
    const buildQuery = useCallback((offset: number, limit: number) => {
        let query = supabase
            .from('Products')
            .select('*, producer:Producers(*), category:ProductCategories(*), product_categories:ProductCategories_Products!inner(*)', { count: 'exact' })
            .eq('publish', true) // Only fetch published products
            .or('stock.gt.0, stock.is.null, backorder.eq.true') // In stock or backorder allowed
        
        if(isVIP){
            query = query.eq('isVip', true);
        }
        else if(isCORP){
            query = query.eq('isCorp', true);
        }
        else{
            query = query.eq('isPublic', true);
        }

        let categoryIds: number[] = [];
        if ((categoryId !== undefined && categoryId !== 42)) {
            categoryIds.push(categoryId);
        }

        if ((subCategoryIds.length > 0)) {
            categoryIds = subCategoryIds;
        }

        if (categoryIds.length > 0) {
            query = query.in('product_categories.categoryId', categoryIds);
        }

        query = query.range(offset, offset + limit - 1);

        // Apply bio filter
        if (isBio) {
            query = query.eq('bio', true);
        }

        // Apply search filter with accent variations
        if (searchText.trim()) {
            const trimmedSearch = searchText.trim();
            const variations = generateAccentVariations(trimmedSearch);
            // Build OR conditions for all variations: name.ilike.%variation1%,name.ilike.%variation2%
            const orConditions = variations
                .map(variation => `name.ilike.%${variation}%`)
                .join(',');
            
            query = query.or(orConditions);
        }

        // Apply sorting
        if (sorting && sorting !== 'default') {
            // For direct queries
            switch (sorting) {
                case 'name-asc':
                    query = query.order('name', { ascending: true });
                    break;
                case 'name-desc':
                    query = query.order('name', { ascending: false });
                    break;
                case 'price-asc':
                    query = query.order('netPrice', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('netPrice', { ascending: false });
                    break;
                default:
                    query = query.order('name', { ascending: true });
                    break;
            }
        } else {
            // Default sorting
            query = query.order('name', { ascending: true });
        }

        return query;
    }, [categoryId, subCategoryIds, isBio, searchText, sorting, isVIP, isCORP]);

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
            const query = buildQuery(offset, PRODUCTS_PER_PAGE);

            const { data, error: supabaseError, count } = await query;

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            let processedProducts: IProductItem[] = [];

            processedProducts = (data as IProductItem[]) ?? [];

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
    }, [categoryId, subCategoryIds, isBio, sorting, searchText, isVIP, isCORP]);

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
