import type { IPickupLocation } from 'src/types/pickup-location';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetPickupLocations() {
    const SWR_KEY = 'pickupLocations';
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: locations, error: dbError } = await supabase
            .from('PickupLocations')
            .select('*')
            .order('name', { ascending: true });

        if (dbError) throw new Error(dbError.message);
        return locations as IPickupLocation[];
    });

    return useMemo(
        () => ({
            locations: data || [],
            locationsLoading: isLoading,
            locationsError: error,
            locationsMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function createPickupLocation(newData: Omit<IPickupLocation, 'id'>) {
    const { data, error } = await supabase
        .from('PickupLocations')
        .insert([newData])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updatePickupLocation(
    id: number,
    updatedData: Partial<Omit<IPickupLocation, 'id'>>
) {
    const { data, error } = await supabase
        .from('PickupLocations')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deletePickupLocation(id: number) {
    const { error } = await supabase.from('PickupLocations').delete().eq('id', id);
    if (error) throw new Error(error.message);
}
