import type { ICategoryItem } from 'src/types/category';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

export async function getCategoryById(id: number): Promise<ICategoryItem | null> {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase
        .from('ProductCategories')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    const { data, error: responseError } = response;

    if (responseError) throw new Error(responseError.message);
    return data as ICategoryItem | null;
}

export async function getCategories(): Promise<ICategoryItem[]> {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const response = await supabase.from('ProductCategories').select('*');
    const { data, error: responseError } = response;

    if (responseError) throw new Error(responseError.message);
    return data as ICategoryItem[] | [];
}
