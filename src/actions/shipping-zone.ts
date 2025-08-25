import type { IShippingZone, IShippingZoneFilters } from 'src/types/shipping-zone';

import useSWR, { mutate } from 'swr';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const ENDPOINTS = {
  list: '/api/shipping-zones',
  details: (id: string) => `/api/shipping-zones/${id}`,
};

export function useGetShippingZones(filters?: IShippingZoneFilters) {
  const { data, error, isLoading } = useSWR(
    [ENDPOINTS.list, filters],
    () => getShippingZones(filters)
  );

  const memoizedValue = {
    shippingZones: (data as IShippingZone[]) || [],
    shippingZonesLoading: isLoading,
    shippingZonesError: error,
    shippingZonesValidating: !error && !data,
    shippingZonesEmpty: !isLoading && !data?.length,
  };

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function getShippingZones(filters?: IShippingZoneFilters): Promise<IShippingZone[]> {
  try {
    let query = supabase.from('ShippingZones').select('*');

    if (filters?.postalCode) {
      query = query.eq('Iranyitoszam', filters.postalCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shipping zones:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getShippingZones:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function checkShippingZoneAvailable(postalCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ShippingZones')
      .select('ID')
      .eq('Iranyitoszam', postalCode)
      .limit(1);

    if (error) {
      console.error('Error checking shipping zone:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkShippingZoneAvailable:', error);
    return false;
  }
}
