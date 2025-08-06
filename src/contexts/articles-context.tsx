"use client";

import type { ReactNode } from "react";
import type { IArticleItem } from "src/types/article";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ICategory {
    id: number;
    title: string;
}

type ArticlesContextType = {
    articles: IArticleItem[];
    categories: ICategory[];
    loading: boolean;
    error: string | null;
    createArticle: (articleData: Omit<IArticleItem, 'id' | 'category' | 'categoryId'>, categoryId: number) => Promise<void>;
    updateArticle: (id: number, articleData: Partial<IArticleItem>, categoryId: number) => Promise<void>;
    deleteArticle: (id: number) => Promise<void>;
};

export const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [articles, setArticles] = useState<IArticleItem[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const [articlesResponse, categoriesResponse] = await Promise.all([
                supabase.from("Articles").select("*, ArticlesCategoriesRelations!inner( ArticleCategories ( id, title ) )"),
                supabase.from("ArticleCategories").select("*")
            ]);

            if (articlesResponse.error) {
                setError(articlesResponse.error.message);
            } else {
                const articlesWithCategories = articlesResponse.data.map(article => ({
                    ...article,
                    category: article.ArticlesCategoriesRelations[0]?.ArticleCategories?.title ?? 'N/A',
                    categoryId: article.ArticlesCategoriesRelations[0]?.ArticleCategories?.id ?? 0,
                }));
                setArticles(articlesWithCategories ?? []);
            }

            if (categoriesResponse.error) {
                setError(categoriesResponse.error.message);
            } else {
                setCategories(categoriesResponse.data ?? []);
            }
            
            setLoading(false);
        }
        fetchData();
    }, []);

    const createArticle = async (articleData: Omit<IArticleItem, 'id' | 'category' | 'categoryId'>, categoryId: number) => {
        const { data: newArticle, error: articleError } = await supabase
            .from('Articles')
            .insert([articleData])
            .select()
            .single();

        if (articleError || !newArticle) {
            setError(articleError?.message || "Hiba a cikk létrehozásakor.");
            return;
        }

        const { error: relationError } = await supabase
            .from('ArticlesCategoriesRelations')
            .insert([{ articleId: newArticle.id, categoryId }]);

        if (relationError) {
            setError(relationError.message);
            return;
        }
        
        const { data: finalArticleData } = await supabase
            .from("Articles")
            .select("*, ArticlesCategoriesRelations!inner( ArticleCategories ( id, title ) )")
            .eq('id', newArticle.id)
            .single();
        
        if (finalArticleData) {
            const articleWithCategory = {
                ...finalArticleData,
                category: finalArticleData.ArticlesCategoriesRelations[0]?.ArticleCategories?.title,
                categoryId: finalArticleData.ArticlesCategoriesRelations[0]?.ArticleCategories?.id,
            };
            setArticles(prev => [...prev, articleWithCategory]);
        }
    };

    const updateArticle = async (id: number, articleData: Partial<IArticleItem>, categoryId: number) => {
        const { error: articleError } = await supabase
            .from('Articles')
            .update(articleData)
            .eq('id', id);

        if (articleError) {
            setError(articleError.message);
            return;
        }

        const { error: relationError } = await supabase
            .from('ArticlesCategoriesRelations')
            .update({ categoryId })
            .eq('articleId', id);

        if (relationError) {
            setError(relationError.message);
            return;
        }
        
        const { data: finalArticleData } = await supabase
            .from("Articles")
            .select("*, ArticlesCategoriesRelations!inner( ArticleCategories ( id, title ) )")
            .eq('id', id)
            .single();

        if (finalArticleData) {
            const updatedArticleWithCategory = {
                ...finalArticleData,
                category: finalArticleData.ArticlesCategoriesRelations[0]?.ArticleCategories?.title,
                categoryId: finalArticleData.ArticlesCategoriesRelations[0]?.ArticleCategories?.id,
            };
            setArticles(prev => prev.map(article => (article.id === id ? updatedArticleWithCategory : article)));
        }
    };

    const deleteArticle = async (id: number) => {
        const { error: relationError } = await supabase
            .from('ArticlesCategoriesRelations')
            .delete()
            .eq('articleId', id);

        if (relationError) {
            setError(relationError.message);
            return;
        }

        const { error: articleError } = await supabase
            .from('Articles')
            .delete()
            .eq('id', id);

        if (articleError) {
            setError(articleError.message);
            return;
        }

        setArticles(prev => prev.filter(article => article.id !== id));
    };

    const value = { articles, categories, loading, error, createArticle, updateArticle, deleteArticle };

    return (
        <ArticlesContext.Provider value={value}>
            {children}
        </ArticlesContext.Provider>
    );
}

export const useArticles = () => {
    const context = useContext(ArticlesContext);
    if (!context) throw new Error("useArticles csak a ArticlesContext-en belül használható");
    return context;
};