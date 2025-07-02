"use client";

import type { ReactNode} from "react";
import type { IProductItem } from "src/types/product";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


type ProductContextType = {
    product: IProductItem | null;
    loading: boolean;
    error: string | null;
};
export const ProductContext = createContext<ProductContextType>({
    product: null,
    loading: false,
    error: null,
});
export interface ProductProviderProps {
    children: ReactNode;
    slug: string;
}
export function ProductProvider({ children, slug }: ProductProviderProps) {
    const [product, setProduct] = useState<IProductItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [loaderror, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase.from("Products").select("*").eq('url', slug).maybeSingle();
            if (error) {
                setError(error.message);
                setProduct(null);
            } else {
                console.log("Fetched products:", data);
                setProduct(data ?? null);
                setError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider value={{ product, loading, error: loaderror }}>
            {children}
        </ProductContext.Provider>
    );
}

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProduct csak a ProductProvider-en belül használható");
  return context;
};