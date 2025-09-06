'use client';

import type { ReactNode } from 'react';
import type { IPostcodeItem } from 'src/types/postcode';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type PostcodeContextType = {
    postcodes: IPostcodeItem[];
    loading: boolean;
    error: string | null;
};

export const PostcodeContext = createContext<PostcodeContextType>({
    postcodes: [],
    loading: false,
    error: null,
});

export function PostcodeProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [postcodes, setPostcodes] = useState<IPostcodeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPostcodes() {
            setLoading(true);
            const { data, error: supabaseError } = await supabase.from('ShippingZones').select('*');
            if (supabaseError) {
                setError(supabaseError.message);
                setPostcodes([]);
            } else {
                setPostcodes(data ?? []);
                setError(null);
            }
            setLoading(false);
        }
        fetchPostcodes();
    }, []);

    return (
        <PostcodeContext.Provider value={{ postcodes, loading, error }}>
            {children}
        </PostcodeContext.Provider>
    );
}

export const useAllPostcodes = () => {
    const context = useContext(PostcodeContext);
    if (!context) throw new Error('usePostcodes csak a PostcodeProvider-en belül használható');
    return context;
};

export const useEnabledPostcodes = () => {
    const context = useContext(PostcodeContext);
    if (!context) throw new Error('usePostcodes csak a PostcodeProvider-en belül használható');

    context.postcodes = context.postcodes.filter((postcode) => postcode.enabled);
    return context;
};
