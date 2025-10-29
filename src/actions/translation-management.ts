'use server';

import type { ITranslation, ITranslationUpdate } from 'src/types/translation';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

async function initSupabase() {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
}
/**
 * Fetch all translations from database
 */
export async function getAllTranslations(): Promise<ITranslation[]> {
    try {
        const supabase = await initSupabase();
        const { data, error } = await supabase
            .from('translations')
            .select('*')
            .order('namespace', { ascending: true })
            .order('key', { ascending: true });

        if (error) {
            console.error('Error fetching translations:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllTranslations:', error);
        throw error;
    }
}

/**
 * Update a translation value
 */
export async function updateTranslation(update: ITranslationUpdate): Promise<void> {
    try {
        const supabase = await initSupabase();

        const { error } = await supabase
            .from('translations')
            .update({ 
                value: update.value,
                updated_at: new Date().toISOString()
            })
            .eq('id', update.id);

        if (error) {
            console.error('Error updating translation:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateTranslation:', error);
        throw error;
    }
}

/**
 * Create a new translation entry
 */
export async function createTranslation(
    language: string,
    namespace: string,
    key: string,
    value: string
): Promise<ITranslation> {
    try {
        const supabase = await initSupabase();

        const { data, error } = await supabase
            .from('translations')
            .insert({
                language,
                namespace,
                key,
                value,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating translation:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in createTranslation:', error);
        throw error;
    }
}

/**
 * Delete translation entries by namespace and key (all languages)
 */
export async function deleteTranslation(namespace: string, key: string): Promise<void> {
    try {
        const supabase = await initSupabase();

        const { error } = await supabase
            .from('translations')
            .delete()
            .eq('namespace', namespace)
            .eq('key', key);

        if (error) {
            console.error('Error deleting translation:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in deleteTranslation:', error);
        throw error;
    }
}

/**
 * Bulk create translations for a new key across all languages
 */
export async function createTranslationKey(
    namespace: string,
    key: string,
    values: Record<string, string>
): Promise<ITranslation[]> {
    try {
        const entries = Object.entries(values).map(([language, value]) => ({
            language,
            namespace,
            key,
            value,
        }));
        const supabase = await initSupabase();

        const { data, error } = await supabase
            .from('translations')
            .insert(entries)
            .select();

        if (error) {
            console.error('Error creating translation key:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in createTranslationKey:', error);
        throw error;
    }
}
