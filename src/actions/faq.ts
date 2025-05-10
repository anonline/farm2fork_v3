import type { SWRConfiguration } from 'swr';
import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

async function fetchFaqCategory(id: number) {
    const response = await supabase.from('FaqCategories').select('*').eq('id', id).maybeSingle();
    const { data, error: responseError } = response;
    const faqCategory = data as IFaqCategoryItem | null;

    if (faqCategory) {
        faqCategory.faqs = await fetchFaqsByCategoryId(faqCategory.id);
    }
    if (responseError) throw responseError.message;
    return faqCategory;
}

async function fetchFaqCategories() {
    const response = await supabase.from('FaqCategories').select('*');
    const { data, error: responseError } = response;
    const faqsCategories = data as IFaqCategoryItem[];

    if (response.count ?? 0) {
        faqsCategories?.map(async (faqsCategory) => {
            faqsCategory.faqs = await fetchFaqsByCategoryId(faqsCategory);
        });
    }
    if (responseError) throw responseError.message;
    return faqsCategories;
}

async function fetchFaqsByCategoryId(faqCategory: number | IFaqCategoryItem) {
    const response = await supabase.from('Faqs').select('*').eq('faqcategoryId', faqCategory);
    const { data, error: responseError } = response;
    const faqs = data as IFaqItem[];

    if (responseError) throw responseError.message;
    return faqs;
}

async function fetchFaq(faqId: number) {
    const response = await supabase.from('Faqs').select('*').eq('id', faqId).maybeSingle();
    const { data, error: responseError } = response;
    const faq = data as IFaqItem | null;

    if (responseError) throw responseError.message;
    return faq;
}

async function fetchFaqs() {
    const response = await supabase.from('Faqs').select('*');
    const { data, error: responseError } = response;
    const faqs = data as IFaqItem[];

    if (responseError) throw responseError.message;
    return faqs;
}

// ----------------------------------------------------------------------

type FaqsData = {
    faqs: IFaqItem[];
};

export function useGetFaqs() {
    const { data, isLoading, error, isValidating } = useSWR<FaqsData>('faqs', async () => {
        const faqs = await fetchFaqs();
        return { faqs };
    },{ ...swrOptions });

    const memoizedValue = useMemo(
        () => ({
            faqs: data?.faqs || [],
            faqsLoading: isLoading,
            faqsError: error,
            faqsValidating: isValidating,
            faqsEmpty: !isLoading && !isValidating && !data?.faqs.length,
        }),
        [data?.faqs, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type FaqData = {
    faq: IFaqItem | null;
};

export function useGetFaq(faqId: number) {
    const { data, isLoading, error, isValidating } = useSWR<FaqData>('faq', async () => {
        const faq = await fetchFaq(faqId);
        return { faq };
    },{ ...swrOptions });

    const memoizedValue = useMemo(
        () => ({
            faq: data?.faq,
            faqLoading: isLoading,
            faqError: error,
            faqValidating: isValidating,
        }),
        [data?.faq, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type ChildFaqData = {
    faqs: IFaqItem[];
};

export function useGetChildFaqs(faqCategoryId: number) {
    const { data, isLoading, error, isValidating } = useSWR<ChildFaqData>('childFaqs', async () => {
        const faqs = await fetchFaqsByCategoryId(faqCategoryId);
        return { faqs };
    },{ ...swrOptions });

    const memoizedValue = useMemo(
        () => ({
            faqs: data?.faqs || [],
            faqsLoading: isLoading,
            faqsError: error,
            faqsValidating: isValidating,
            faqsEmpty: !isLoading && !isValidating && !data?.faqs.length,
        }),
        [data?.faqs, error, isLoading, isValidating]
    );

    return memoizedValue;
}
// ----------------------------------------------------------------------

type FaqCategoryData = {
    faqCategory: IFaqCategoryItem | null;
};

export function useGetFaqCategory(faqId: number) {
    const { data, isLoading, error, isValidating } = useSWR<FaqCategoryData>('faqCategory', async () => {
            const faqCategory = await fetchFaqCategory(faqId);
            return { faqCategory };
        },{ ...swrOptions });

    const memoizedValue = useMemo(
        () => ({
            faqCategory: data?.faqCategory,
            faqCategoryLoading: isLoading,
            faqCategoryError: error,
            faqCategoryValidating: isValidating,
        }),
        [data?.faqCategory, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

type FaqCategoriesData = {
    faqsCategories: IFaqCategoryItem[];
};

export function useGetFaqCategories() {
    const { data, isLoading, error, isValidating } = useSWR<FaqCategoriesData>(
        'faqsCategory',
        async () => {
            const response = await supabase.from('FaqCategories').select('*');
            const { data: faqsCategories, error: responseError } = response;

            if (faqsCategories) {
                faqsCategories?.map(async (faqsCategory: IFaqCategoryItem) => {
                    faqsCategory.faqs = await fetchFaqsByCategoryId(faqsCategory.id);
                });
            }

            if (responseError) throw responseError.message;
            return { faqsCategories };
        
    },{ ...swrOptions });

    const memoizedValue = useMemo(
        () => ({
            faqsCategories: data?.faqsCategories,
            faqsCategoriesLoading: isLoading,
            faqsCategoriesError: error,
            faqsCategoriesValidating: isValidating,
        }),
        [data?.faqsCategories, error, isLoading, isValidating]
    );

    return memoizedValue;
}
