import { useCallback } from 'react';

import { handleAuthSessionError } from '../utils/supabase-error-handler';

// ----------------------------------------------------------------------

/**
 * Hook that provides a wrapper for API calls that automatically handles auth errors
 */
export function useAuthErrorHandler() {
    const withAuthErrorHandling = useCallback(async <T>(
        apiCall: () => Promise<T>,
        options?: {
            onError?: (error: any) => void;
            onAuthError?: () => void;
            suppressLog?: boolean;
        }
    ): Promise<T | null> => {
        try {
            return await apiCall();
        } catch (error) {
            if (!options?.suppressLog) {
                console.error('API call failed:', error);
            }
            
            // Handle auth session errors
            await handleAuthSessionError(error);
            
            // Call auth error handler if provided
            if (options?.onAuthError) {
                options.onAuthError();
            }
            
            // Call general error handler if provided
            if (options?.onError) {
                options.onError(error);
            }
            
            return null;
        }
    }, []);

    return { withAuthErrorHandling };
}