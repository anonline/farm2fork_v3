'use server';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

/**
 * Server action to fetch translations from database
 */
export async function getTranslationsFromDB(
    language: string,
    namespace: string
): Promise<any> {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);

        const { data, error } = await supabase
            .from('translations')
            .select('key, value')
            .eq('language', language)
            .eq('namespace', namespace);

        if (error) {
            console.error('Error fetching translations from database:', error);
            throw error;
        }

        const translations: { [key: string]: string } = {};
        for (const item of data ?? []) {
            translations[item.key] = item.value;
        }

        return translations;
    } catch (error) {
        console.error('Error in getTranslationsFromDB:', error);
        throw error;
    }
}
