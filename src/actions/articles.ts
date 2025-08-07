import type { SWRConfiguration } from 'swr';
import type { IArticleItem } from 'src/types/article';

import { supabase } from 'src/lib/supabase';


const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};


export async function insertNewArticle(newArticleData: Omit<IArticleItem, 'id'|'categories'|'categoryIds'>, categoryIds: number[]) {
    if (
        !newArticleData.title ||
        !newArticleData.year ||
        !newArticleData.medium ||
        !newArticleData.link ||
        !newArticleData.image ||
        !newArticleData.publish_date ||
        !newArticleData.publish
    ) {
        throw new Error('Hiányzó kötelező mezők');
    }

    const yearNum = Number(newArticleData.year);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(newArticleData.year) || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        throw new Error(`Az évszámnak 1900 és ${currentYear} között kell lennie.`);
    }

    const { data: newArticle, error: articleError } = await supabase
        .from('Articles')
        .insert([{
            title: newArticleData.title,
            medium: newArticleData.medium,
            image: newArticleData.image,
            year: newArticleData.year,
            link: newArticleData.link,
            publish_date: newArticleData.publish_date,
            publish: newArticleData.publish,
        }])
        .select('id')
        .single();

    if (articleError || !newArticle) {
        throw new Error(articleError?.message || 'A cikk létrehozása sikertelen.');
    }

    if (categoryIds && categoryIds.length > 0) {
        const relationsToInsert = categoryIds.map(categoryId => ({
            articleId: newArticle.id,
            categoryId,
        }));

        const { error: relationError } = await supabase
            .from('ArticlesCategoriesRelations')
            .insert(relationsToInsert);

        if (relationError) {
            throw new Error(`A cikk létrejött (ID: ${newArticle.id}), de a kategória kapcsolatok mentése sikertelen: ${relationError.message}`);
        }
    }
    
    return newArticle;
}

export async function updateArticle(articleId: number, updatedArticleData: Partial<IArticleItem>, categoryIds: number[]) {
    if (
        !updatedArticleData.title ||
        !updatedArticleData.year ||
        !updatedArticleData.medium ||
        !updatedArticleData.link ||
        !updatedArticleData.image ||
        !updatedArticleData.publish_date ||
        !updatedArticleData.publish
    ) {
        throw new Error('Hiányzó kötelező mezők');
    }

    const yearNum = Number(updatedArticleData.year);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(updatedArticleData.year) || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        throw new Error(`Az évszámnak 1900 és ${currentYear} között kell lennie.`);
    }

    const { error: articleError } = await supabase
        .from('Articles')
        .update(updatedArticleData)
        .eq('id', articleId);

    if (articleError) {
        throw new Error(articleError.message);
    }
    
    const { error: deleteError } = await supabase
        .from('ArticlesCategoriesRelations')
        .delete()
        .eq('articleId', articleId);
    
    if (deleteError) {
        throw new Error(`A cikk adatai frissültek, de a régi kategória kapcsolatok törlése sikertelen: ${deleteError.message}`);
    }

    if (categoryIds && categoryIds.length > 0) {
        const relationsToInsert = categoryIds.map(categoryId => ({
            articleId,
            categoryId,
        }));

        const { error: insertError } = await supabase
            .from('ArticlesCategoriesRelations')
            .insert(relationsToInsert);

        if (insertError) {
            throw new Error(`A cikk adatai frissültek, de az új kategória kapcsolatok mentése sikertelen: ${insertError.message}`);
        }
    }
    
    return { success: true, articleId };
}