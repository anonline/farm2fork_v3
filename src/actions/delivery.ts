import type { IDeliveryPerson } from 'src/types/delivery';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';



export function useGetDeliveries() {
  const SWR_KEY = 'deliveries';

  const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
    const { data: deliveries, error: dbError } = await supabase
      .from('Delivery')
      .select('*')
      .order('name', { ascending: true });
    
    if (dbError) throw new Error(dbError.message);
    return deliveries;
  });

  const memoizedValue = useMemo(
    () => ({
      deliveries: (data as IDeliveryPerson[]) || [],
      deliveriesLoading: isLoading,
      deliveriesError: error,
      deliveriesMutate: mutate,
    }),
    [data, error, isLoading, mutate]
  );

  return memoizedValue;
}

export function useGetDelivery(id: string) {
    const SWR_KEY = id ? `delivery-${id}` : null;

    const { data, isLoading, error } = useSWR(SWR_KEY, async () => {
        const { data: delivery, error: dbError } = await supabase
            .from('Delivery')
            .select('*')
            .eq('id', id)
            .single();

        if (dbError) throw new Error(dbError.message);
        return delivery;
    });

    return {
        delivery: data as IDeliveryPerson | undefined,
        deliveryLoading: isLoading,
        deliveryError: error,
    };
}


export async function createDelivery(deliveryData: Omit<IDeliveryPerson, 'id'>) {
    if (!deliveryData.name || !deliveryData.phone) {
        throw new Error('A név és a telefonszám megadása kötelező.');
    }
    const { data, error } = await supabase.from('Delivery').insert([deliveryData]).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateDelivery(id: number, deliveryData: Omit<IDeliveryPerson, 'id'>) {
    if (!deliveryData.name || !deliveryData.phone) {
        throw new Error('A név és a telefonszám megadása kötelező.');
    }
    const { data, error } = await supabase.from('Delivery').update(deliveryData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteDeliveries(ids: number[]) {
    if (!ids || ids.length === 0) {
        throw new Error('Nincsenek törlésre kijelölt elemek.');
    }
    const { error } = await supabase.from('Delivery').delete().in('id', ids);
    if (error) throw new Error(error.message);
    return { success: true };
}