import type { SWRConfiguration } from 'swr';
import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';
import { IArticleItem } from 'src/types/article';
import { title } from 'process';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export async function insertNewArticle(newArticleItem: IArticleItem) {
    if (
        !newArticleItem.title ||
        !newArticleItem.year ||
        !newArticleItem.medium ||
        !newArticleItem.link ||
        !newArticleItem.image ||
        !newArticleItem.publish_date ||
        !newArticleItem.publish
    ) {
        throw new Error('Hiányzó kötelező mezők');
    }

    newArticleItem.id = undefined; // Ensure id is not set for new articles

    //Validate year
    const yearNum = Number(newArticleItem.year);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(newArticleItem.year) || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        throw new Error(`Az évszámnak 1900 és ${currentYear} között kell lennie.`);
    }


    const { data, error } = await supabase.from('Articles').insert([{
        title   : newArticleItem.title,
        medium  : newArticleItem.medium,
        image   : newArticleItem.image,
        year    : newArticleItem.year,
        link    : newArticleItem.link,      
        publish_date: newArticleItem.publish_date,
        publish : newArticleItem.publish,   
    }]).select('id');

    if (error) {
        throw error.message;
    }

    return data;
}

export async function updateArticle(articleId: number, updatedArticleItem: IArticleItem) {
    if (
        !updatedArticleItem.title ||
        !updatedArticleItem.year ||
        !updatedArticleItem.medium ||
        !updatedArticleItem.link ||
        !updatedArticleItem.image ||
        !updatedArticleItem.publish_date ||
        !updatedArticleItem.publish
    ) {
        throw new Error('Hiányzó kötelező mezők');
    }

    // Validate year
    const yearNum = Number(updatedArticleItem.year);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(updatedArticleItem.year) || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        throw new Error(`Az évszámnak 1900 és ${currentYear} között kell lennie.`);
    }

    const { data, error } = await supabase.from('Articles').update(updatedArticleItem).eq('id', articleId).select('id');

    if (error) {
        throw error.message;
    }

    return data;
}