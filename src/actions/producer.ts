import type { SWRConfiguration } from 'swr';
import type { IProducerItem } from 'src/types/producer';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
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
  const { data, error } = await supabase.from('Producers').select('id').eq('slug', slug).maybeSingle();

  if (error) {
    console.error('Hiba a producer lekérdezése közben (slug alapján):', error.message);
    throw new Error(error.message);
  }

  return { producer: data as { id: number } | null };
}

// ----------------------------------------------------------------------

export async function createProducer(producerData: Partial<IProducerItem>) {
  const { error } = await supabase.from('Producers').insert([producerData]);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateProducer(id: number, producerData: Partial<IProducerItem>) {
  const { error } = await supabase.from('Producers').update(producerData).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteProducer(id: number) {
  const { error } = await supabase.from('Producers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}