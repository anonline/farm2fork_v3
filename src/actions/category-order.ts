
import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

import { OptionsEnum } from 'src/types/option';

/**
 * Client-side hook to fetch category order
 */
export function useGetCategoryOrder() {
    const SWR_KEY = `option-${OptionsEnum.CategoryOrder}`;
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: optionData, error: dbError } = await supabase
            .from('Options')
            .select('value')
            .eq('name', OptionsEnum.CategoryOrder)
            .maybeSingle();

        if (dbError && dbError.code !== 'PGRST116') {
            throw new Error(dbError.message);
        }

        if (!optionData || !optionData.value) {
            return [];
        }

        try {
            const parsed = JSON.parse(optionData.value);
            return Array.isArray(parsed) ? parsed.map((id) => Number(id)) : [];
        } catch {
            return [];
        }
    });

    return useMemo(
        () => ({
            categoryOrder: data ?? [],
            categoryOrderLoading: isLoading,
            categoryOrderError: error,
            categoryOrderMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

/**
 * Client-side function to update category order
 */
export async function updateCategoryOrder(categoryIds: number[]) {
    const value = JSON.stringify(categoryIds);

    const { error } = await supabase
        .from('Options')
        .update({ value })
        .eq('name', OptionsEnum.CategoryOrder);

    if (error) throw new Error(error.message);

    return true;
}
