import type { IPartner } from 'src/types/partner';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetPartners() {
    const SWR_KEY = 'partners';
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: partners, error: dbError } = await supabase
            .from('Partners')
            .select('*')
            .order('order', { ascending: true });

        if (dbError) throw new Error(dbError.message);
        return partners as IPartner[];
    });

    return useMemo(
        () => ({
            partners: data || [],
            partnersLoading: isLoading,
            partnersError: error,
            partnersMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function createPartner(partnerData: Omit<IPartner, 'id' | 'order'>) {
    const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('Partners')
        .select('order')
        .order('order', { ascending: false })
        .limit(1)
        .single();

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
        throw new Error(maxOrderError.message);
    }

    const newOrder = maxOrderData ? maxOrderData.order + 1 : 0;

    const { data, error } = await supabase
        .from('Partners')
        .insert([{ ...partnerData, order: newOrder }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updatePartner(
    id: number,
    partnerData: Pick<IPartner, 'name' | 'imageUrl' | 'link'>
) {
    const { data, error } = await supabase
        .from('Partners')
        .update(partnerData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deletePartner(id: number) {
    const { error: deleteError } = await supabase.from('Partners').delete().eq('id', id);
    if (deleteError) throw new Error(deleteError.message);

    const { data: remainingPartners, error: fetchError } = await supabase
        .from('Partners')
        .select('*')
        .order('order', { ascending: true });

    if (fetchError) throw new Error(fetchError.message);

    const updatedOrderPartners = remainingPartners.map((partner, index) => ({
        ...partner,
        order: index,
    }));

    const { error: updateError } = await supabase.from('Partners').upsert(updatedOrderPartners);
    if (updateError) throw new Error(updateError.message);

    return { success: true };
}

export async function updatePartnerOrder(partners: IPartner[]) {
    const updates = partners.map((partner, index) => ({
        ...partner,
        order: index,
    }));

    const { error } = await supabase.from('Partners').upsert(updates);
    if (error) throw new Error(error.message);

    return updates;
}
