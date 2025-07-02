"use client";

import type { ReactNode } from "react";
import type { IProductItem } from "src/types/product";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type ProductsContextType = {
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

interface ProductsInCategoryProviderProps {
    children: ReactNode;
    categoryId: number;
}

export const ProductsInCategoryContext = createContext<ProductsContextType>({
    products: [],
    loading: false,
    error: null,
});

export function ProductsInCategoryProvider({ children, categoryId }: ProductsInCategoryProviderProps) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProductsByCategory() {
            if (!categoryId) {
                setProducts([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const { data, error: supabaseError } = await supabase
                .from("ProductCategories_Products")
                .select(
                    "Products(*)"
                )
                .eq('categoryId', categoryId);

            if (supabaseError) {
                setError(supabaseError.message);
                setProducts([]);
            }
            else {
                const extractedProducts = (data?.map(item => item.Products).filter(Boolean) as unknown as IProductItem[]) ?? [];
                setProducts(extractedProducts);
                setError(null);
            }
            setLoading(false);
        }

        fetchProductsByCategory();
    }, [categoryId]);

    return (
        <ProductsInCategoryContext.Provider value={{ products, loading, error }}>
            {children}
        </ProductsInCategoryContext.Provider>
    );
}

export const useProductsInCategory = () => {
    const context = useContext(ProductsInCategoryContext);
    if (!context) {
        throw new Error("useProductsInCategory csak a ProductsInCategoryProvider-en belül használható");
    }
    return context;
};






export const ProductsInMonthInCategoryContext = createContext<ProductsContextType>({
    products: [],
    loading: true,
    error: null,
});

interface ProductsInMonthInCategoryProviderProps {
    children: ReactNode;
    categoryId: number;
    month: string;
}


export function ProductsInMonthInCategoryProvider({ children, categoryId, month }: ProductsInMonthInCategoryProviderProps) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const monthNames: Record<string, string> = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December"
    };

    useEffect(() => {
        async function fetchFilteredProducts() {
            if (!categoryId && !month) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            let query = supabase
                .from("ProductCategories_Products")
                .select(`
                    Products(*)
                `);

            if (categoryId) {
                query = query.eq('categoryId', categoryId);
            }
            if (month) {
                query = query.contains('Products.seasonality', [monthNames[month]]);
            }

            const { data, error: supabaseError } = await query;
            console.log('sb', data);
            console.log('sb', month);
            console.log('sb', categoryId);
            if (supabaseError) {
                setError(supabaseError.message);
                setProducts([]);
            } else {
                const extractedProducts = (data?.map(category => category.Products) as unknown as IProductItem[]) ?? [];
                setProducts(extractedProducts);
                setError(null);
            }
            setLoading(false);
        }

        fetchFilteredProducts();
    }, [categoryId, month]);

    return (
        <ProductsInMonthInCategoryContext.Provider value={{ products, loading, error }}>
            {children}
        </ProductsInMonthInCategoryContext.Provider>
    );
}

export const useProductsInMonthInCategory = () => {
    const context = useContext(ProductsInMonthInCategoryContext);
    if (!context) {
        throw new Error("useProductsInMonthInCategory csak a ProductsInMonthInCategoryProvider-en belül használható");
    }
    return context;
};