import type { IFaqItem, IFaqCategoryItem } from 'src/types/faq';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

export async function fetchFaqCategory(id: number) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase.from('FaqCategories').select('*').eq('id', id).maybeSingle();
    const { data, error: responseError } = response;
    const faqCategory = data as IFaqCategoryItem | null;

    if (faqCategory) {
        faqCategory.faqs = await fetchFaqsByCategoryId(faqCategory.id);
    }
    if (responseError) throw responseError.message;
    return faqCategory;
}

export async function fetchFaqCategories() {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
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

export async function fetchFaqsByCategoryId(faqCategory: number | IFaqCategoryItem) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase.from('Faqs').select('*').eq('faqcategoryId', faqCategory);
    const { data, error: responseError } = response;
    const faqs = data as IFaqItem[];

    if (responseError) throw responseError.message;
    return faqs;
}

export async function fetchFaq(faqId: number) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase.from('Faqs').select('*').eq('id', faqId).maybeSingle();
    const { data, error: responseError } = response;
    const faq = data as IFaqItem | null;

    if (responseError) throw responseError.message;
    return faq;
}

export async function fetchFaqs() {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase.from('Faqs').select('*');
    const { data, error: responseError } = response;
    const faqs = data as IFaqItem[];

    if (responseError) throw responseError.message;
    return faqs;
}
