import type { IShippingZone } from 'src/types/shipping';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetShippingZones() {
    const SWR_KEY = 'shippingZones';

    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: zones, error: dbError } = await supabase
            .from('ShippingZones')
            .select('*')
            .order('Iranyitoszam', { ascending: true });

        if (dbError) throw new Error(dbError.message);
        return zones as IShippingZone[];
    });

    return useMemo(
        () => ({
            shippingZones: data || [],
            shippingZonesLoading: isLoading,
            shippingZonesError: error,
            shippingZonesMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function createShippingZoneRules(rules: Omit<IShippingZone, 'ID'>[]) {
    if (!rules || rules.length === 0) {
        throw new Error('Nincsenek hozzáadandó szabályok.');
    }
    const { error } = await supabase.from('ShippingZones').insert(rules);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteShippingZoneRules(ids: number[]) {
    if (!ids || ids.length === 0) {
        throw new Error('Nincsenek törlésre kijelölt szabályok.');
    }
    const { error } = await supabase.from('ShippingZones').delete().in('ID', ids);
    if (error) throw new Error(error.message);
    return { success: true };
}
