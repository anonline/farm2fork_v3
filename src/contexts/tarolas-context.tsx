'use client';

import type { ReactNode } from 'react';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext } from 'react';

export interface IStoragingMethod {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type TarolasContextType = {
    tarolasMod: IStoragingMethod[];
    loading: boolean;
    error: string | null;
};

export const TarolasContext = createContext<TarolasContextType>({
    tarolasMod: [],
    loading: true,
    error: null,
});

export function TarolasProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [tarolasMod, setTarolasMod] = useState<IStoragingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStoringMethods() {
            setLoading(true);

            const { data, error: supabaseError } = await supabase
                .from('StoragingMothods')
                .select('*')
                .order('order', { ascending: true });

            if (supabaseError) {
                console.error('Hiba a tárolási módok lekérésekor:', supabaseError);
                setError(supabaseError.message);
                setTarolasMod([]);
            } else {
                setTarolasMod(data ?? []);
                setError(null);
            }
            setLoading(false);
        }

        fetchStoringMethods();
    }, []);

    return (
        <TarolasContext.Provider value={{ tarolasMod, loading, error }}>
            {children}
        </TarolasContext.Provider>
    );
}

export const useTarolas = () => {
    const context = useContext(TarolasContext);
    if (!context) {
        throw new Error('useTarolas csak a TarolasProvider-en belül használható');
    }
    return context;
};
