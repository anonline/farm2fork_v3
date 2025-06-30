"use client";

import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IPostcodeItem = {
    id: number;
    postcode: string;
    enabled: boolean;
};

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
            const { data, error } = await supabase.from("Postcodes").select("*");
            if (error) {
                setError(error.message);
                setPostcodes([]);
            } else {
                setPostcodes(data || []);
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

export const usePostcodes = () => {
    const context = useContext(PostcodeContext);
    if (!context) throw new Error("usePostcodes csak a PostcodeProvider-en belül használható");
    return context;
};