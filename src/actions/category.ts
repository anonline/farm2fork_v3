import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';
import type { ICategoryItem } from 'src/types/category';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';
import { deleteImageAndCleanDB } from 'src/lib/blob/blobService';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

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

////----
export async function useDeleteCategoryById(categoryId: number): Promise<boolean> {
    const coverUrl = await supabase
        .from('ProductCategories')
        .select('coverUrl')
        .eq('id', categoryId)
        .maybeSingle();

    try {
        if (coverUrl.data?.coverUrl) {
            await deleteImageAndCleanDB(coverUrl.data?.coverUrl);
        }

        const { error } = await supabase.from('ProductCategories').delete().eq('id', categoryId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Hiba a kategória törlésekor:', error);
        return false;
    }
}

export async function insertCategory(category: Partial<ICategoryItem>): Promise<ICategoryItem> {
    const { data, error } = await supabase
        .from('ProductCategories')
        .insert(category)
        .select()
        .single();

    if (error) throw error;
    return data as ICategoryItem;
}

export async function updateCategory(category: Partial<ICategoryItem>): Promise<ICategoryItem> {
    const coverUrl = await supabase
        .from('ProductCategories')
        .select('coverUrl')
        .eq('id', category.id)
        .maybeSingle();

    if (category.id == 8 && category.parentId != null) {
        category.parentId = null; // Prevent changing the root category's parent
    }

    const { data, error } = await supabase
        .from('ProductCategories')
        .update(category)
        .eq('id', category.id)
        .select()
        .maybeSingle();

    if (error) throw error;

    if (coverUrl.data?.coverUrl && category.coverUrl !== coverUrl.data.coverUrl) {
        console.log(coverUrl.data.coverUrl);
        await deleteImageAndCleanDB(coverUrl.data.coverUrl);
    }

    return data as ICategoryItem;
}

export async function deleteCategoryById(categoryId: number): Promise<boolean> {
    const coverUrl = await supabase
        .from('ProductCategories')
        .select('coverUrl')
        .eq('id', categoryId)
        .maybeSingle();

    try {
        if (coverUrl.data?.coverUrl) {
            await deleteImageAndCleanDB(coverUrl.data?.coverUrl);
        }

        const { error } = await supabase.from('ProductCategories').delete().eq('id', categoryId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Hiba a kategória törlésekor:', error);
        return false;
    }
}

export async function deleteCategoriesByIds(categoryIds: number[]): Promise<boolean> {
    try {
        await Promise.all(
            categoryIds.map(async (id) => {
                await deleteCategoryById(id);
            })
        );
        return true;
    } catch {
        return false;
    }
}
