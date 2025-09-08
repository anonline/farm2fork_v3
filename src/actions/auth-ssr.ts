import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

/**
 * Get the current authenticated user from server-side request
 */
export async function getCurrentUserSSR(): Promise<{ user: any | null; error: string | null }> {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Error getting current user (SSR):', error);
            return { user: null, error: error.message };
        }

        return { user, error: null };
    } catch (error) {
        console.error('Unexpected error getting current user (SSR):', error);
        return { user: null, error: 'Failed to get current user' };
    }
}
