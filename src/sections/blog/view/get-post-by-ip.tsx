"use server";

import type { IArticleItem } from "src/types/article";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export async function getPostById(id: string): Promise<{ post: IArticleItem | null }> {
    const { data, error } = await supabase
        .from("Articles")
        .select("*, ArticlesCategoriesRelations ( ArticleCategories ( title ) )")
        .eq('id', id)
        .single();

    if (error) {
        return { post: null };
    }
    
    const postWithCategory = data ? {
        ...data,
        category: data.ArticlesCategoriesRelations.ArticleCategories?.title
    } : null;

    return { post: postWithCategory };
}