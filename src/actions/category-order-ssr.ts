import type { Option } from 'src/types/option';
import type { ICategoryItem } from 'src/types/category';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

import { OptionsEnum } from 'src/types/option';

/**
 * Server-side function to fetch category order from database
 */
export async function getCategoryOrder(): Promise<number[]> {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);

        const { data, error } = await supabase
            .from('Options')
            .select('value')
            .eq('name', OptionsEnum.CategoryOrder)
            .maybeSingle();

        if (error) {
            console.error('Error fetching category order:', error);
            return [];
        }

        if (!data || !data.value) {
            return [];
        }

        try {
            const parsed = JSON.parse(data.value);
            return Array.isArray(parsed) ? parsed.map((id) => Number(id)) : [];
        } catch (parseError) {
            console.error('Error parsing category order:', parseError);
            return [];
        }
    } catch (error) {
        console.error('Could not fetch category order:', error);
        return [];
    }
}

/**
 * Server-side function to update category order in database
 */
export async function updateCategoryOrderSSR(categoryIds: number[]): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);

        const value = JSON.stringify(categoryIds);

        const { error } = await supabase
            .from('Options')
            .update({ value })
            .eq('name', OptionsEnum.CategoryOrder);

        if (error) {
            console.error('Error updating category order:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Could not update category order:', error);
        return false;
    }
}
