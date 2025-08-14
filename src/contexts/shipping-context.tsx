'use client';

import type { ReactNode } from 'react';
import type { IShippingZone } from 'src/types/shipping';

import { useState, useEffect, useContext, useCallback, createContext } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

type ShippingContextType = {
  shippingZones: IShippingZone[];
  loading: boolean;
  error: string | null;
  mutate: () => Promise<void>;
};

export const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export function ShippingProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [shippingZones, setShippingZones] = useState<IShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingZones = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('ShippingZones')
        .select('*')
        .order('Iranyitoszam', { ascending: true })
        .order('RendelesiNap', { ascending: true });

      if (dbError) throw dbError;

      setShippingZones(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShippingZones();
  }, [fetchShippingZones]);

  const memoizedValue = {
    shippingZones,
    loading,
    error,
    mutate: fetchShippingZones,
  };

  return <ShippingContext.Provider value={memoizedValue}>{children}</ShippingContext.Provider>;
}

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};