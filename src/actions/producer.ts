import type { SWRConfiguration } from 'swr';
import type { IProducerItem } from 'src/types/producer';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';
import { fetcher, endpoints } from 'src/lib/axios';


// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ProducersData = {
  producers: IProducerItem[];
};

export function useGetProducers() {
  const url = endpoints.product.list;

  //const { data, isLoading, error, isValidating } = useSWR<ProductsData>(url, fetcher, swrOptions);

  const { data, isLoading, error, isValidating } = useSWR<ProducersData>("producers", async () =>  {
    const response = await supabase.from("Producers").select("*");
    
    const { data: producers, error:responseError } = response;
    
    if (responseError) throw responseError.message;
    return { producers };
  }, swrOptions);
  
  const memoizedValue = useMemo(
    () => ({
      producers: data?.producers || [],
      producersLoading: isLoading,
      producersError: error,
      producersValidating: isValidating,
      producersEmpty: !isLoading && !isValidating && !data?.producers.length,
    }),
    [data?.producers, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ProducerData = {
  producer: IProducerItem;
};

export function useGetProducer(producerId: string) {
  const url = producerId ? [endpoints.product.details, { params: { producerId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<ProducerData>("producer", async () =>  {
    const response = await supabase.from("Producers").select("*").eq("id", producerId).single();
    const { data: producer, error:responseError } = response;
    
    if (responseError) throw responseError.message;
    return { producer };
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      product: data?.producer,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.producer, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ProducerSearchResultsData = {
  results: IProducerItem[];
};

export function useSearchProducers(query: string) {
  const url = query ? [endpoints.product.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<ProducerSearchResultsData>(url, async () =>  {
    const response = await supabase.from("Producers").select("*").ilike("name", query).single();
    const { data: producer, error:responseError } = response;
    
    if (responseError) throw responseError.message;
    return { results: producer };
  }, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
