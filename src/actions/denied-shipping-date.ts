'use server';

import type { IDeniedShippingDate, IDeniedShippingDateCreate } from 'src/types/denied-shipping-date';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';


// ----------------------------------------------------------------------

/**
 * Fetch all denied shipping dates
 */
const supabase = async () => {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
};

export async function fetchDeniedShippingDates(): Promise<IDeniedShippingDate[]> {
    try {
        const supabaseClient = await supabase();
        const { data, error } = await supabaseClient
            .from('DeniedShippingDates')
            .select('date')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching denied shipping dates:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchDeniedShippingDates:', error);
        throw error;
    }
}

/**
 * Add a new denied shipping date
 */
export async function addDeniedShippingDate(
    dateData: IDeniedShippingDateCreate
): Promise<IDeniedShippingDate> {
    try {
        const supabaseClient = await supabase();
        const { data, error } = await supabaseClient
            .from('DeniedShippingDates')
            .insert([{ date: dateData.date }])
            .select()
            .single();

        if (error) {
            console.error('Error adding denied shipping date:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in addDeniedShippingDate:', error);
        throw error;
    }
}

/**
 * Remove a denied shipping date
 */
export async function removeDeniedShippingDate(date: string): Promise<void> {
    try {
        const supabaseClient = await supabase();
        const { error } = await supabaseClient
            .from('DeniedShippingDates')
            .delete()
            .eq('date', date);

        if (error) {
            console.error('Error removing denied shipping date:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in removeDeniedShippingDate:', error);
        throw error;
    }
}

/**
 * Check if a specific date is denied
 */
export async function isDateDenied(date: string): Promise<boolean> {
    try {
        const supabaseClient = await supabase();
        const { data, error } = await supabaseClient
            .from('DeniedShippingDates')
            .select('date')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking if date is denied:', error);
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error in isDateDenied:', error);
        return false;
    }
}

/**
 * Toggle a denied shipping date (add if not exists, remove if exists)
 */
export async function toggleDeniedShippingDate(date: string): Promise<{ isDenied: boolean }> {
    try {
        // Check if date exists
        const isDenied = await isDateDenied(date);

        if (isDenied) {
            // Remove the date
            await removeDeniedShippingDate(date);
            return { isDenied: false };
        } else {
            // Add the date
            await addDeniedShippingDate({ date });
            return { isDenied: true };
        }
    } catch (error) {
        console.error('Error in toggleDeniedShippingDate:', error);
        throw error;
    }
}
