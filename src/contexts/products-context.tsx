"use client";

import type { ReactNode} from "react";
import type { IProductItem } from "src/types/product";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


type ProductsContextType = {
    products: IProductItem[];
    loading: boolean;
    error: string | null;
};
export const ProductsContext = createContext<ProductsContextType>({
    products: [],
    loading: false,
    error: null,
});

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loaderror, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error: supabaseError } = await supabase.from("Products").select("*");
            if (supabaseError) {
                setError(supabaseError.message);
                setProducts([]);
            } else {
                console.log("Fetched products:", data);
                setProducts(data || []);
                setError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    return (
        <ProductsContext.Provider value={{ products, loading, error: loaderror }}>
            {children}
        </ProductsContext.Provider>
    );
}

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts csak a ProductsProvider-en belül használható");
  return context;
};