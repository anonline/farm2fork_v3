"use client";

import type { ReactNode } from "react";
import type { IProductCategoryConnection } from "src/types/product";

import { createClient } from "@supabase/supabase-js";
import { useMemo, useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ProductCategoryConnectionContextType = {
    connection: IProductCategoryConnection[];
    loading: boolean;
    error: string | null;
};

export const ProductCategoryConnectionContext = createContext<ProductCategoryConnectionContextType>({
    connection: [],
    loading: true,
    error: null,
});

export function ProductCategoryConnectionProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [connection, setConnection] = useState<IProductCategoryConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchConnection() {
            setLoading(true);

            const { data, error: responseError } = await supabase
                .from("ProductCategories_Products")
                .select("*")

            if (responseError) {
                setError(responseError.message);
                setConnection([]);
            } else {
                setConnection(data ?? []);
                setError(null);
            }
            setLoading(false);
        }

        fetchConnection();
    }, []);

    const memoizedValue = useMemo(
        () => ({
            connection,
            loading,
            error,
        }),
        [connection, loading, error]
    );

    return (
        <ProductCategoryConnectionContext.Provider value={memoizedValue}>
            {children}
        </ProductCategoryConnectionContext.Provider>
    );
}

export const useProductCategoryConnection = () => {
    const context = useContext(ProductCategoryConnectionContext);
    if (!context) {
        throw new Error("useProductCategoryConnection can only be used within a ProductCategoryConnectionContextProvider");
    }
    return context;
};