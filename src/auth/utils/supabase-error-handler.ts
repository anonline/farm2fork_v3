import { supabase } from 'src/lib/supabase';
import { removeSupabaseAuthCookies } from 'src/utils/cookie-utils';

// ----------------------------------------------------------------------

/**
 * Checks if an error is a Supabase auth error that requires session cleanup
 */
export function isAuthSessionError(error: any): boolean {
    if (!error) return false;
    
    const isAuthError = error.__isAuthError || error.name === 'AuthApiError';
    const isRefreshTokenError = 
        error.code === 'refresh_token_not_found' ||
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('Refresh Token Not Found');
    
    return isAuthError && isRefreshTokenError;
}

/**
 * Handles auth session errors by clearing the invalid session
 */
export async function handleAuthSessionError(error: any): Promise<void> {
    if (isAuthSessionError(error)) {
        console.warn('Detected invalid refresh token, cleaning up session:', error.message);
        
        try {
            // Sign out to clear the invalid session
            await supabase.auth.signOut();
            // Remove all Supabase auth token cookies
            removeSupabaseAuthCookies();
        } catch (signOutError) {
            console.error('Error during session cleanup:', signOutError);
            // Still try to remove cookies even if signOut fails
            removeSupabaseAuthCookies();
        }
    }
}

/**
 * Wrapper for Supabase auth operations that handles refresh token errors
 */
export async function safeAuthOperation<T>(
    operation: () => Promise<T>,
    onError?: (error: any) => void
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        console.error('Auth operation failed:', error);
        
        // Handle refresh token errors
        await handleAuthSessionError(error);
        
        // Call optional error handler
        if (onError) {
            onError(error);
        }
        
        return null;
    }
}