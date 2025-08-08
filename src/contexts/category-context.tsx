"use client";

import type { ReactNode } from "react";
import type { ICategoryItem } from "src/types/category";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


type CategoriesContextType = {
    categories: ICategoryItem[];
    loading: boolean;
    error: string | null;
};
export const CategoryContext = createContext<CategoriesContextType>({
    categories: [],
    loading: false,
    error: null,
});

export function CategoryProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [categories, setCategories] = useState<ICategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data, error } = await supabase.from("ProductCategories").select("*").eq("enabled", true).order("order", { ascending: true });
            if (error) {
                setLoadError(error.message);
                setCategories([]);
            } else {
                console.log("Fetched categories:", data);
                const sortedCategories = sortCategoriesByChildren(data ?? []);
                setCategories(sortedCategories);
                console.log("sorted:", sortedCategories);

                setLoadError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, loading, error: loadError }}>
            {children}
        </CategoryContext.Provider>
    );
}

const sortCategoriesByChildren = (categories: ICategoryItem[], parentId: number | null = null, level: number = 0): ICategoryItem[] => {
    const children = categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name)); 

    return children.flatMap(child => {
        const childWithLevel = { ...child, level };

        return [
            childWithLevel,
            ...sortCategoriesByChildren(categories, child.id, level + 1)
        ];
    });
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error("useCategories can only be used within a CategoryProvider");
    return context;
};
