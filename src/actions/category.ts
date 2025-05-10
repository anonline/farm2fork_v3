import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';
import type { ICategoryItem } from 'src/types/category';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type CategoriesData = {
    categories: ICategoryItem[];
};

export function useGetProductCategories() {
    const { data, isLoading, error, isValidating } = useSWR<CategoriesData>(
        'categories',
        async () => {
            const response = await supabase.from('ProductCategories').select('*');
            const { data: categories, error: responseError } = response;

            if (responseError) throw responseError.message;
            return { categories };
        }
    );

    const memoizedValue = useMemo(
        () => ({
            categories: data?.categories || [],
            categoriesLoading: isLoading,
            categoriesError: error,
            categoriesValidating: isValidating,
            categoriesEmpty: !isLoading && !isValidating && !data?.categories.length,
        }),
        [data?.categories, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type CategoryData = {
    category: IProductItem;
};

export function useGetProduct(categoryId: string) {
    const { data, isLoading, error, isValidating } = useSWR<CategoryData>('category', async () => {
        const response = await supabase
            .from('ProductCategories')
            .select('*')
            .eq('id', categoryId)
            .single();
        const { data: category, error: responseError } = response;

        if (responseError) throw responseError.message;
        return { category };
    });

    const memoizedValue = useMemo(
        () => ({
            category: data?.category,
            categoryLoading: isLoading,
            categoryError: error,
            categoryValidating: isValidating,
        }),
        [data?.category, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type SearchResultsData = {
    results: ICategoryItem[];
};

export function useSearchCategories(query: string) {
    const { data, isLoading, error, isValidating } = useSWR<SearchResultsData>(
        'searchCategory',
        async () => {
            const response = await supabase
                .from('ProductCategories')
                .select('*')
                .textSearch('name_description', query);
            const { data: results, error: responseError } = response;

            if (responseError) throw responseError.message;
            return { results };
        },
        { ...swrOptions, keepPreviousData: true }
    );

    const memoizedValue = useMemo(
        () => ({
            searchResults: data?.results || [],
            searchLoading: isLoading,
            searchError: error,
            searchValidating: isValidating,
            searchEmpty: !isLoading && !isValidating && !data?.results.length,
        }),
        [data?.results, error, isLoading, isValidating]
    );

    return memoizedValue;
}
