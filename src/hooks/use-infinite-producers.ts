'use client';

import type { IProducerItem } from 'src/types/producer';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/global-config';

import { SortingOrder } from 'src/types/search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get configuration from global config
const PRODUCERS_PER_PAGE = CONFIG.pagination.producersPerPage;

export interface UseInfiniteProducersProps {
    keyword?: string;
    sortDirection?: SortingOrder;
}

export interface UseInfiniteProducersReturn {
    producers: IProducerItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    reset: () => void;
    totalCount: number;
}

export function useInfiniteProducers({
    keyword = '',
    sortDirection = SortingOrder.Ascending,
}: UseInfiniteProducersProps = {}): UseInfiniteProducersReturn {
    const [producers, setProducers] = useState<IProducerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Build the query based on filters
    const buildQuery = useCallback((offset: number, limit: number) => {
        let query = supabase
            .from('Producers')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);

        // Apply search filter
        if (keyword.trim()) {
            query = query.or(`name.ilike.%${keyword}%,shortDescription.ilike.%${keyword}%,companyName.ilike.%${keyword}%`);
        }

        // Apply sorting
        const ascending = sortDirection === SortingOrder.Ascending;
        query = query.order('name', { ascending });

        return query;
    }, [keyword, sortDirection]);

    // Fetch producers for a specific page
    const fetchProducers = useCallback(async (page: number, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setError(null);
            } else {
                setLoadingMore(true);
            }

            const offset = page * PRODUCERS_PER_PAGE;
            console.log(`Fetching page ${page}, offset: ${offset}, PRODUCERS_PER_PAGE: ${PRODUCERS_PER_PAGE}`);
            const query = buildQuery(offset, PRODUCERS_PER_PAGE);
            
            const { data, error: supabaseError, count } = await query;

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            const processedProducers: IProducerItem[] = (data as IProducerItem[]) ?? [];

            console.log(`Received ${processedProducers.length} producers, total count: ${count}, reset: ${reset}`);

            if (reset) {
                setProducers(processedProducers);
                setCurrentPage(0);
                setTotalCount(count ?? 0);
                setHasMore(processedProducers.length === PRODUCERS_PER_PAGE && processedProducers.length < (count ?? 0));
            } else {
                // Deduplicate producers by ID to avoid React key conflicts
                let updatedProducers: IProducerItem[] = [];
                setProducers(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProducers = processedProducers.filter(p => !existingIds.has(p.id));
                    updatedProducers = [...prev, ...newProducers];
                    return updatedProducers;
                });
                
                setTotalCount(count ?? 0);
                // Check if we got a full page and if there are more producers to load
                const newHasMore = processedProducers.length === PRODUCERS_PER_PAGE && (offset + PRODUCERS_PER_PAGE) < (count ?? 0);
                console.log(`Setting hasMore to ${newHasMore}: processedProducers.length=${processedProducers.length}, PRODUCERS_PER_PAGE=${PRODUCERS_PER_PAGE}, offset=${offset}, count=${count}`);
                setHasMore(newHasMore);
            }
            
            setError(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Hiba történt a termelők betöltése során');
            if (reset) {
                setProducers([]);
                setTotalCount(0);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [buildQuery]);

    // Load more producers
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = currentPage + 1;
            console.log(`Loading page ${nextPage}, current producers: ${producers.length}, hasMore: ${hasMore}`);
            setCurrentPage(nextPage);
            fetchProducers(nextPage, false);
        }
    }, [currentPage, fetchProducers, hasMore, loadingMore, producers.length]);

    // Reset and reload from beginning
    const reset = useCallback(() => {
        setCurrentPage(0);
        setHasMore(true);
        fetchProducers(0, true);
    }, [fetchProducers]);

    // Effect to reload producers when filters change
    useEffect(() => {
        setCurrentPage(0);
        setHasMore(true);
        fetchProducers(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, sortDirection]);

    return {
        producers,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        reset,
        totalCount,
    };
}

export { PRODUCERS_PER_PAGE };