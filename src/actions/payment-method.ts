import type { IPaymentMethod } from 'src/types/payment-method';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetPaymentMethods() {
    const SWR_KEY = 'paymentMethods';
    const { data, isLoading, error, mutate } = useSWR(SWR_KEY, async () => {
        const { data: methods, error: dbError } = await supabase
            .from('PaymentMethods')
            .select('*')
            .order('name', { ascending: true });

        if (dbError) throw new Error(dbError.message);
        return methods as IPaymentMethod[];
    });

    return useMemo(
        () => ({
            methods: data || [],
            methodsLoading: isLoading,
            methodsError: error,
            methodsMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function createPaymentMethod(newData: Omit<IPaymentMethod, 'id'>) {
    const { data, error } = await supabase
        .from('PaymentMethods')
        .insert([newData])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updatePaymentMethod(
    id: number,
    updatedData: Partial<Omit<IPaymentMethod, 'id'>>
) {
    const { data, error } = await supabase
        .from('PaymentMethods')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deletePaymentMethod(id: number) {
    const { data: method, error: fetchError } = await supabase
        .from('PaymentMethods')
        .select('protected')
        .eq('id', id)
        .single();
    if (fetchError || !method) throw new Error('A fizetési mód nem található.');
    if (method.protected) throw new Error('Védett fizetési mód nem törölhető.');

    const { error } = await supabase.from('PaymentMethods').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}
