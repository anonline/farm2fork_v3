'use client';

import { useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
    hasMore: boolean;
    loading: boolean;
    onLoadMore: () => void;
    threshold?: number; // Distance from bottom in pixels to trigger load more
}

export function useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore,
    threshold = 200,
}: UseInfiniteScrollProps) {
    const handleScroll = useCallback(() => {
        if (loading || !hasMore) return;

        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - threshold;

        if (scrolledToBottom) {
            onLoadMore();
        }
    }, [hasMore, loading, onLoadMore, threshold]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return null;
}
