"use client";

import type { ReactNode} from "react";
import type { IArticleItem } from "src/types/article";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


type ArticlesContextType = {
    articles: IArticleItem[];
    loading: boolean;
    error: string | null;
};
export const ArticlesContext = createContext<ArticlesContextType>({
    articles: [],
    loading: false,
    error: null,
});

export function ArticlesProvider({ children }: Readonly<{ children: ReactNode }>) {

    const [articles, setArticles] = useState<IArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);

            const { data, error: supabaseError } = await supabase
                .from("Articles")
                .select("*, ArticlesCategoriesRelations ( ArticleCategories ( title ) )");
            if (supabaseError) {
                setError(supabaseError.message);
                setArticles([]);
            } else {
                const articlesWithCategories = data.map(article => ({
                    ...article,
                    category: article.ArticlesCategoriesRelations.ArticleCategories?.title
                    }));
                setArticles(articlesWithCategories || []);
                setError(null);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    return (
        <ArticlesContext.Provider value={{articles, loading, error }}>
            {children}
        </ArticlesContext.Provider>
    );
}

export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) throw new Error("useArticles csak a ArticlesContext-en belül használható");
  return context;
};