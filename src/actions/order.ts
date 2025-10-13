'use client';

import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import { getAllOrders, getAllOrdersBatched, getAllOrdersCountsByStatus } from './order-management';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export function useGetOrdersCountByStatus() {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        'orders-count-by-status',
        () => getAllOrdersCountsByStatus(),
        swrOptions
    );

    const memoizedValue = useMemo(
        () => ({
        ordersCountByStatus: data || {},
        ordersCountByStatusLoading: isLoading,
        ordersCountByStatusError: error,
        ordersCountByStatusValidating: isValidating,
        refreshOrdersCountByStatus: mutate,
        }), [data, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}

/**
 * React hook to get orders with SWR
 */
export function useGetOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
}) {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        ['orders', params],
        () => getAllOrders(params),
        swrOptions
    );

    const memoizedValue = useMemo(
        () => ({
            orders: data?.orders || [],
            ordersLoading: isLoading,
            ordersError: error || data?.error,
            ordersValidating: isValidating,
            ordersEmpty: !isLoading && !isValidating && !data?.orders?.length,
            ordersTotalCount: data?.total || 0,
            refreshOrders: mutate,
        }),
        [data, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}

export function useGetAllOrdersBatched(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
}) {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        ['orders', params],
        () => getAllOrdersBatched(params),
        swrOptions
    );

    const memoizedValue = useMemo(
        () => ({
            orders: data?.orders || [],
            ordersLoading: isLoading,
            ordersError: error || data?.error,
            ordersValidating: isValidating,
            ordersEmpty: !isLoading && !isValidating && !data?.orders?.length,
            ordersTotalCount: data?.total || 0,
            refreshOrders: mutate,
        }),
        [data, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}

    
