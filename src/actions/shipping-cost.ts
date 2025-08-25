import type { IShippingCostMethod } from 'src/types/shipping-cost';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetShippingCostMethods() {
  const SWR_KEY = 'shippingCostMethods';
  const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
    const { data: methods, error: dbError } = await supabase
      .from('ShippingCostsMethods')
      .select('*')
      .order('name', { ascending: true });
    
    if (dbError) throw new Error(dbError.message);
    return methods as IShippingCostMethod[];
  });

  return useMemo(() => ({
      methods: data || [],
      methodsLoading: isLoading,
      methodsError: error,
      methodsMutate: mutate,
    }), [data, error, isLoading, mutate]);
}

export async function createShippingCostMethod(newData: Omit<IShippingCostMethod, 'id'>) {
    const { data, error } = await supabase
        .from('ShippingCostsMethods')
        .insert([newData])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateShippingCostMethod(id: number, updatedData: Partial<Omit<IShippingCostMethod, 'id'>>) {
    const { data, error } = await supabase
        .from('ShippingCostsMethods')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteShippingCostMethod(id: number) {
    const { error } = await supabase.from('ShippingCostsMethods').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}