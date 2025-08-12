"use client";

import type { ReactNode} from "react";
import type { ICategory, IArticleItem } from "src/types/article";

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useContext, useCallback, createContext } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ArticlesContextType = {
    articles: IArticleItem[];
    categories: ICategory[];
    loading: boolean;
    error: string | null;
    refetchArticles: () => Promise<void>;
    createArticle: (articleData: Omit<IArticleItem, 'id' | 'categories' | 'categoryIds'>, categoryIds: number[]) => Promise<any>;
    updateArticle: (id: number, articleData: Partial<IArticleItem>, categoryIds: number[]) => Promise<any>;
    deleteArticle: (id: number) => Promise<void>;
};

export const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [articles, setArticles] = useState<IArticleItem[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [articlesResponse, categoriesResponse] = await Promise.all([
            supabase.from("Articles").select("*, ArticlesCategoriesRelations( ArticleCategories ( id, title ) )"),
            supabase.from("ArticleCategories").select("*")
        ]);

        if (articlesResponse.error) {
            setError(articlesResponse.error.message);
        } else {
            const articlesWithCategories = articlesResponse.data.map(article => {
                let relations = [];
                if (article.ArticlesCategoriesRelations) {
                    relations = Array.isArray(article.ArticlesCategoriesRelations)
                        ? article.ArticlesCategoriesRelations
                        : [article.ArticlesCategoriesRelations];
                }
                return {
                    ...article,
                    categories: relations.map((rel: any) => rel.ArticleCategories).filter(Boolean),
                    categoryIds: relations.map((rel: any) => rel.ArticleCategories?.id).filter(Boolean),
                };
            });
            setArticles(articlesWithCategories ?? []);
        }

        if (categoriesResponse.error) {
            setError(categoriesResponse.error.message);
        } else {
            setCategories(categoriesResponse.data ?? []);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const createArticle = async (articleData: Omit<IArticleItem, 'id' | 'categories' | 'categoryIds'>, categoryIds: number[]) => {
        const { data: newArticle, error: articleError } = await supabase.from('Articles').insert([articleData]).select().single();
        if (articleError) { throw new Error(articleError.message); }
        if (!newArticle) { throw new Error("Hiba a cikk létrehozásakor."); }

        const relationsToInsert = categoryIds.map(catId => ({ articleId: newArticle.id, categoryId: catId }));
        const { error: relationError } = await supabase.from('ArticlesCategoriesRelations').insert(relationsToInsert);
        if (relationError) { throw new Error(relationError.message); }

        return newArticle;
    };

    const updateArticle = async (id: number, articleData: Partial<IArticleItem>, categoryIds: number[]) => {
        const { error: articleError } = await supabase.from('Articles').update(articleData).eq('id', id);
        if (articleError) { throw new Error(articleError.message); }

        const { error: deleteError } = await supabase.from('ArticlesCategoriesRelations').delete().eq('articleId', id);
        if (deleteError) { throw new Error(deleteError.message); }

        if (categoryIds && categoryIds.length > 0) {
            const relationsToInsert = categoryIds.map(catId => ({ articleId: id, categoryId: catId }));
            const { error: insertError } = await supabase.from('ArticlesCategoriesRelations').insert(relationsToInsert);
            if (insertError) { throw new Error(insertError.message); }
        }
    };

    const deleteArticle = async (id: number) => {
        const { error: relationError } = await supabase.from('ArticlesCategoriesRelations').delete().eq('articleId', id);
        if (relationError) { throw new Error(relationError.message); }

        const { error: articleError } = await supabase.from('Articles').delete().eq('id', id);
        if (articleError) { throw new Error(articleError.message); }
    };

    const value = { articles, categories, loading, error, refetchArticles: fetchArticles, createArticle, updateArticle, deleteArticle };

    return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export const useArticles = () => {
    const context = useContext(ArticlesContext);
    if (!context) throw new Error("useArticles csak a ArticlesContext-en belül használható");
    return context;
};