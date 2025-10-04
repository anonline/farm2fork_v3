'use client';

import type { ReactNode } from 'react';
import type { IProductItem } from 'src/types/product';

import { createClient } from '@supabase/supabase-js';
import { useMemo, useState, useEffect, useContext, createContext } from 'react';

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
export function ProductProvider({ children, slug }: Readonly<ProductProviderProps>) {
    const [product, setProduct] = useState<IProductItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [loaderror, setLoaderror] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase
                .from('Products')
                .select('*, producer:Producers!left(*)')
                .eq('url', slug)
                .maybeSingle();
            if (error) {
                setLoaderror(error.message);
                setProduct(null);
            } else if (data) {
                // If product is a bundle, fetch bundle items
                if (data.type === 'bundle') {
                    const { data: bundleData, error: bundleError } = await supabase
                        .from('ProductsInBoxes')
                        .select('productId, qty, product:Products!ProductsInBoxes_productId_fkey(*)')
                        .eq('boxId', data.id);

                    if (bundleError) {
                        console.error('Error fetching bundle items:', bundleError);
                    } else if (bundleData) {
                        // Map bundle items to the expected format
                        const bundleItems = bundleData.map((item: any) => ({
                            productId: item.productId.toString(),
                            qty: item.qty,
                            product: item.product,
                        }));
                        setProduct({ ...data, bundleItems });
                        setLoaderror(null);
                        console.log('fetching:', { ...data, bundleItems });
                        setLoading(false);
                        return;
                    }
                }
                setProduct(data ?? null);
                setLoaderror(null);
                console.log('fetching:', data);
            } else {
                setProduct(null);
                setLoaderror(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [slug]);

    const contextValue = useMemo(() => ({
        product,
        loading,
        error: loaderror
    }), [product, loading, loaderror]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
}

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProduct csak a ProductProvider-en belül használható');
    return context;
};
