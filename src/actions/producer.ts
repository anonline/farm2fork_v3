import type { SWRConfiguration } from 'swr';
import type { IProducerItem } from 'src/types/producer';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateOnMount: true,
    revalidateIfStale: false,
    revalidateOnFocus: true,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ProducersData = {
    producers: IProducerItem[];
};

export function useGetProducers() {
    const { data, isLoading, error, isValidating, mutate } = useSWR<ProducersData>(
        'producers',
        async () => {
            const response = await supabase.from('Producers').select('*');
            const { data: producers, error: responseError } = response;
            if (responseError) throw responseError.message;
            return { producers };
        },
        swrOptions
    );

    const memoizedValue = useMemo(
        () => ({
            producers: data?.producers ?? [],
            producersLoading: isLoading,
            producersError: error,
            producersValidating: isValidating,
            producersEmpty: !isLoading && !isValidating && !data?.producers.length,
            producersMutate: mutate,
        }),
        [data?.producers, error, isLoading, isValidating, mutate]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProducerBySlug(slug: string) {
    const swrKey = slug ? ['producer', slug] : null;

    const { data, isLoading, error, isValidating } = useSWR(swrKey, async () => {
        const response = await supabase.from('Producers').select('*').eq('slug', slug).single();
        const { data: producer, error: responseError } = response;
        if (responseError) throw responseError;
        return producer;
    });

    const memoizedValue = useMemo(
        () => ({
            producer: data,
            producerLoading: isLoading,
            producerError: error,
            producerValidating: isValidating,
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export async function fetchGetProducerBySlug(slug: string) {
    const { data, error } = await supabase
        .from('Producers')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error('Hiba a producer lekérdezése közben (slug alapján):', error.message);
        throw new Error(error.message);
    }

    return { producer: data as { id: string } | null };
}

// ----------------------------------------------------------------------

// src/actions/producer.ts

export async function createProducer(producerData: Partial<IProducerItem>) {
    const { data, error } = await supabase
        .from('Producers')
        .insert([producerData])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

export async function insertProducer(producerData: Partial<IProducerItem>) {
    const { data, error } = await supabase.from('Producers').insert(producerData).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateProducer(id: string, producerData: Partial<IProducerItem>) {
    const { error } = await supabase.from('Producers').update(producerData).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function deleteProducer(id: string) {
    const { error } = await supabase.from('Producers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function updateProductAssignments(producerId: string, newProductIds: string[]) {
    console.log('Updating product assignments for producer:', producerId);
    console.log('New product IDs to assign:', newProductIds);
    const { data: currentProducts, error: fetchError } = await supabase
        .from('Products')
        .select('id')
        .eq('producerId', producerId);

    if (fetchError) throw new Error('A meglévő termékek lekérdezése sikertelen.');

    const currentProductIds = currentProducts.map((p) => p.id.toString());

    const productsToAssign = newProductIds.filter((id) => !currentProductIds.includes(id));
    const productsToUnassign = currentProductIds.filter((id) => !newProductIds.includes(id));

    const operations = [];

    if (productsToAssign.length > 0) {
        operations.push(
            supabase.from('Products').update({ producerId }).in('id', productsToAssign)
        );
    }

    if (productsToUnassign.length > 0) {
        operations.push(
            supabase.from('Products').update({ producerId: null }).in('id', productsToUnassign)
        );
    }

    const results = await Promise.all(operations);

    const failedOp = results.find((res) => res.error);
    if (failedOp) {
        throw new Error(
            `Hiba a termék-hozzárendelések frissítése során: ${failedOp.error?.message}`
        );
    }

    return { success: true };
}
