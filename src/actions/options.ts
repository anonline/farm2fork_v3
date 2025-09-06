import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

import { OptionsEnum } from 'src/types/option';

export function useGetOption(option: OptionsEnum) {
    const SWR_KEY = `option-${option}`;
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: optionData, error: dbError } = await supabase
            .from('Options')
            .select('value, type')
            .eq('name', option)
            .maybeSingle();

        if (dbError && dbError.code !== 'PGRST116') {
            throw new Error(dbError.message);
        }

        if (!optionData) {
            // Return default values for purchase options if they don't exist
            switch (option) {
                case OptionsEnum.MinimumPurchaseForPublic:
                case OptionsEnum.MinimumPurchaseForVIP:
                case OptionsEnum.MinimumPurchaseForCompany:
                    return 5000; // Default minimum purchase amount
                default:
                    return null;
            }
        }

        // Convert value based on type
        switch (optionData.type) {
            case 'number':
                return Number(optionData.value);
            case 'boolean':
                return optionData.value === 'true';
            default:
                return optionData.value;
        }
    });

    return useMemo(
        () => ({
            option: data ?? null,
            optionLoading: isLoading,
            optionError: error,
            optionMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function updateOption(option: OptionsEnum, value: any) {
    // First, try to update the existing option
    const { data: updateData, error: updateError } = await supabase
        .from('Options')
        .update({ value: String(value) })
        .eq('name', option);

    // If there was a different error, throw it
    if (updateError) throw new Error(updateError.message);

    return true;
}
