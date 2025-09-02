import type { ICategory } from 'src/types/article';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetArticleCategories() {
    const SWR_KEY = 'articleCategories';

    const { data, isLoading, error, isValidating, mutate } = useSWR<ICategory[]>(
        SWR_KEY,
        async () => {
            const [categoriesResponse, articlesResponse] = await Promise.all([
                supabase.from('ArticleCategories').select('*').order('title', { ascending: true }),
                supabase
                    .from('Articles')
                    .select('ArticlesCategoriesRelations(categoryId:categoryId)'),
            ]);

            if (categoriesResponse.error) throw new Error(categoriesResponse.error.message);
            if (articlesResponse.error) throw new Error(articlesResponse.error.message);

            const categoryCounts: { [key: number]: number } = {};
            articlesResponse.data.forEach((article: any) => {
                article.ArticlesCategoriesRelations.forEach((relation: { categoryId: number }) => {
                    categoryCounts[relation.categoryId] =
                        (categoryCounts[relation.categoryId] || 0) + 1;
                });
            });

            const categoriesWithCounts: ICategory[] = (categoriesResponse.data ?? []).map(
                (category) => ({
                    ...category,
                    articleCount: categoryCounts[category.id] || 0,
                })
            );

            return categoriesWithCounts;
        }
    );

    const memoizedValue = useMemo(
        () => ({
            categories: data || [],
            categoriesLoading: isLoading,
            categoriesError: error,
            categoriesValidating: isValidating,
            categoriesEmpty: !isLoading && !isValidating && !data?.length,
            categoriesMutate: mutate,
        }),
        [data, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}

export async function createArticleCategory(title: string) {
    if (!title || title.trim() === '') {
        throw new Error('A kategória neve nem lehet üres!');
    }

    const { data, error } = await supabase
        .from('ArticleCategories')
        .insert([{ title }])
        .select()
        .single();

    if (error) {
        throw new Error(error.message || 'A kategória létrehozása sikertelen.');
    }
    return data;
}

export async function updateArticleCategory(id: number, title: string) {
    if (!title || title.trim() === '') {
        throw new Error('A kategória neve nem lehet üres!');
    }

    const { data, error } = await supabase
        .from('ArticleCategories')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message || 'A kategória frissítése sikertelen.');
    }
    return data;
}

export async function deleteArticleCategories(ids: number[]) {
    if (!ids || ids.length === 0) {
        throw new Error('Nincsenek törlésre kijelölt elemek.');
    }

    const { error: relationError } = await supabase
        .from('ArticlesCategoriesRelations')
        .delete()
        .in('categoryId', ids);
    if (relationError) {
        throw new Error(`A kapcsolatok törlése sikertelen: ${relationError.message}`);
    }

    const { error: deleteError } = await supabase.from('ArticleCategories').delete().in('id', ids);
    if (deleteError) {
        throw new Error(`A kategóriák törlése sikertelen: ${deleteError.message}`);
    }

    return { success: true };
}
