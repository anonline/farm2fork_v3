'use client';

import type { ReactNode } from 'react';
import type { IPartner } from 'src/types/partner';

import { useState, useEffect, useContext, useCallback, createContext } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

type PartnersContextType = {
    partners: IPartner[];
    partnersLoading: boolean;
    partnersError: string | null;
    partnersMutate: () => Promise<void>;
};

export const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

export function PartnersProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [partners, setPartners] = useState<IPartner[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(true);
    const [partnersError, setPartnersError] = useState<string | null>(null);

    const fetchPartners = useCallback(async () => {
        setPartnersLoading(true);
        setPartnersError(null);

        try {
            const { data, error } = await supabase
                .from('Partners')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;

            setPartners(data || []);
        } catch (error: any) {
            setPartnersError(error.message);
        } finally {
            setPartnersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const memoizedValue = {
        partners,
        partnersLoading,
        partnersError,
        partnersMutate: fetchPartners,
    };

    return <PartnersContext.Provider value={memoizedValue}>{children}</PartnersContext.Provider>;
}

export const usePartners = () => {
    const context = useContext(PartnersContext);

    if (!context) {
        throw new Error('usePartners must be used within a PartnersProvider');
    }

    return context;
};
