'use client';

import type { ReactNode } from "react";
import type { IProducerItem } from "src/types/producer";

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ProducersContextType = {
    producers: IProducerItem[];
    loading: boolean;
    error: string | null;
};
export const ProducersContext = createContext<ProducersContextType>({
    producers: [],
    loading: false,
    error: null,
});

export function ProducersProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [producers, setProducers] = useState<IProducerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducers() {
            setLoading(true);
            const { data, error } = await supabase
                .from('Producers')
                .select('*')
                .order('name', { ascending: true });
            if (error) {
                setLoadError(error.message);
                setProducers([]);
            } else {
                setProducers(data ?? []);
                setLoadError(null);
            }
            setLoading(false);
        }
        fetchProducers();
    }, []);

    return (
        <ProducersContext.Provider value={{ producers, loading, error: loadError }}>
            {children}
        </ProducersContext.Provider>
    );
}

export const useProducers = () => {
    const context = useContext(ProducersContext);
    if (!context) throw new Error("useProducers csak a ProducersProvider-en belül használható");
    return context;
};
