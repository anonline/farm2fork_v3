"use client";

import type { ReactNode } from "react";
import type { IProductItem } from "src/types/product";

import { createClient } from "@supabase/supabase-js";
import { useMemo, useState, useEffect, useContext, createContext } from "react";

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

export function ProductsProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error: supabaseError } = await supabase.from("Products").select("*, producer:Producers(*), category:ProductCategories(*)").order('name', { ascending: true });
            if (supabaseError) {
                setLoadError(supabaseError.message);
                setProducts([]);
            } else {
                setProducts(data ?? []);
                setLoadError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const value = useMemo(() => ({
        products,
        loading,
        error: loadError
    }), [products, loading, loadError]);

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
}

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) throw new Error("useProducts csak a ProductsProvider-en belül használható");
    return context;
};

export const useProductFilterCategory = (categoryId: number | undefined, isBio: boolean, sorting: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default') => {
    const context = useContext(ProductsContext);
    if (!context) throw new Error("useProducts csak a ProductsProvider-en belül használható");
    if (categoryId != undefined && categoryId != 8) {  //8 = all products
        let products = context.products.filter(p => p.category?.filter(c=>c.id == categoryId).length ?? 0 > 0);
        let loading = context.loading;
        let error = context.loading;
        if (sorting) {
            products = products.sort((a, b) => {
                if (sorting === 'name-asc') return a.name.localeCompare(b.name);
                if (sorting === 'name-desc') return b.name.localeCompare(a.name);
                if (sorting === 'price-asc') return a.netPrice - b.netPrice;
                if (sorting === 'price-desc') return b.netPrice - a.netPrice;
                return 0;
            });
        }

        if(isBio) {
            products = products.filter(p => p.bio);
        }
        return {products, loading, error};
    }
    if(sorting) {
        let sortedProducts = context.products.sort((a, b) => {
            if (sorting === 'name-asc') return a.name.localeCompare(b.name);
            if (sorting === 'name-desc') return b.name.localeCompare(a.name);
            if (sorting === 'price-asc') return a.netPrice - b.netPrice;
            if (sorting === 'price-desc') return b.netPrice - a.netPrice;
            return 0;
        });
        if(isBio) {
            sortedProducts = sortedProducts.filter(p => p.bio);
        }

        return { products: sortedProducts, loading: context.loading, error: context.error };
    }

    return context;
}

//--------------------------------------------------------------------------------------

interface ProductsInCategoryProviderProps {
    children: ReactNode;
    categoryId?: number;
}

export const ProductsInCategoryContext = createContext<ProductsContextType>({
    products: [],
    loading: false,
    error: null,
});

export function ProductsInCategoryProvider({ children, categoryId }: Readonly<ProductsInCategoryProviderProps>) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProductsByCategory() {

            setLoading(true);
            setError(null);

            let supabaseResponse = supabase
                .from("ProductCategories_Products")
                .select(
                    "Products(*)"
                )

            if (categoryId) {
                supabaseResponse = supabaseResponse.eq('categoryId', categoryId);
            }

            const { data, error: supabaseError } = await supabaseResponse

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

    const value = useMemo(() => ({
        products,
        loading,
        error
    }), [products, loading, error]);

    return (
        <ProductsInCategoryContext.Provider value={value}>
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

//--------------------------------------------------------------------------------------

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

export function ProductsInMonthInCategoryProvider({ children, categoryId, month }: Readonly<ProductsInMonthInCategoryProviderProps>) {
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

    const value = useMemo(() => ({
        products,
        loading,
        error
    }), [products, loading, error]);

    return (
        <ProductsInMonthInCategoryContext.Provider value={value}>
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

//--------------------------------------------------------------------------------------

export const FeaturedProductsContext = createContext<ProductsContextType>({
    products: [],
    loading: false,
    error: null,
});

export function FeaturedProductsProvider({ children, limit = 5 }: Readonly<{ children: ReactNode, limit?: number }>) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error: supabaseError } = await supabase.from("Products").select("*").eq('featured', true).limit(limit);
            if (supabaseError) {
                setLoadError(supabaseError.message);
                setProducts([]);
            } else {
                setProducts(data ?? []);
                setLoadError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const value = useMemo(() => ({
        products,
        loading,
        error: loadError
    }), [products, loading, loadError]);

    return (
        <FeaturedProductsContext.Provider value={value}>
            {children}
        </FeaturedProductsContext.Provider>
    );
}

export const useFeaturedProducts = () => {
    const context = useContext(FeaturedProductsContext);
    if (!context) throw new Error("useFeaturedProducts csak a FeaturedProductsContext-en belül használható");
    return context;
};

//--------------------------------------------------------------------------------------

export const StarProductsContext = createContext<ProductsContextType>({
    products: [],
    loading: false,
    error: null,
});

export function StarProductsProvider({ children, limit = 1 }: Readonly<{ children: ReactNode, limit?: number }>) {
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error: supabaseError } = await supabase.from("Products").select("*").eq('star', true).limit(limit);
            if (supabaseError) {
                setLoadError(supabaseError.message);
                setProducts([]);
            } else {
                setProducts(data ?? []);
                setLoadError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const value = useMemo(() => ({
        products,
        loading,
        error: loadError
    }), [products, loading, loadError]);

    return (
        <StarProductsContext.Provider value={value}>
            {children}
        </StarProductsContext.Provider>
    );
}

export const useStarProducts = () => {
    const context = useContext(StarProductsContext);
    if (!context) throw new Error("useStarProducts csak a StarProductsProvider-en belül használható");
    return context;
};