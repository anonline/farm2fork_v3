'use client';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { removeSupabaseAuthCookies } from 'src/utils/cookie-utils';

import axios from 'src/lib/axios';
import { supabase } from 'src/lib/supabase';

import { isAuthSessionError, handleAuthSessionError } from 'src/auth/utils/supabase-error-handler';

import { AuthContext } from '../auth-context';

import type { AuthState, UserRoles } from '../../types';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: Readonly<Props>) {
    const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

    const checkUserSession = useCallback(async () => {
        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error('Session check error:', error);
                
                // Handle specific refresh token errors
                if (isAuthSessionError(error)) {
                    await handleAuthSessionError(error);
                }
                
                setState({ user: null, loading: false });
                delete axios.defaults.headers.common.Authorization;
                
                // Don't throw for auth session missing errors as this is expected when not logged in
                if (!error.message?.includes('Auth session missing')) {
                    console.warn('Authentication error handled:', error.message);
                }
                return;
            }

            if (session) {
                const accessToken = session?.access_token;
                const payload = JSON.parse(atob(accessToken.split('.')[1]));

                const roles = {
                    isAdmin: payload.user_metadata?.admin ?? false,
                    isCorp: payload.user_metadata?.corp ?? false,
                    isVip: payload.user_metadata?.vip ?? false,
                    isPublic: !(payload.user_metadata?.admin || payload.user_metadata?.corp || payload.user_metadata?.vip) || true,
                } as UserRoles;

                if (session?.user?.user_metadata) {
                    session.user.user_metadata.is_admin = payload.user_metadata?.admin ?? false;
                    session.user.user_metadata.is_corp = payload.user_metadata?.corp ?? false;
                    session.user.user_metadata.is_vip = payload.user_metadata?.vip ?? false;
                    session.user.user_metadata.discountPercent = payload.user_metadata?.discountPercent ?? 0;
                }

                setState({ user: { ...session, ...session?.user }, loading: false, roles });
                axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            } else {
                setState({ user: null, loading: false });
                delete axios.defaults.headers.common.Authorization;
            }
        } catch (error) {
            console.error('Unexpected session check error:', error);
            setState({ user: null, loading: false });
            delete axios.defaults.headers.common.Authorization;
            
            // Handle auth session errors
            await handleAuthSessionError(error);
        }
    }, [setState]);

    useEffect(() => {
        checkUserSession();

        // Listen for auth state changes (token refresh, sign out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setState({ user: null, loading: false });
                delete axios.defaults.headers.common.Authorization;
                // Remove all Supabase auth token cookies when signing out
                removeSupabaseAuthCookies();
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session) {
                    const accessToken = session.access_token;
                    
                    try {
                        const payload = JSON.parse(atob(accessToken.split('.')[1]));

                        if (session.user?.user_metadata) {
                            session.user.user_metadata.is_admin = payload.user_metadata?.admin ?? false;
                            session.user.user_metadata.is_corp = payload.user_metadata?.corp ?? false;
                            session.user.user_metadata.is_vip = payload.user_metadata?.vip ?? false;
                            session.user.user_metadata.discountPercent = payload.user_metadata?.discountPercent ?? 0;
                        }

                        setState({ user: { ...session, ...session.user }, loading: false });
                        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                    } catch (error) {
                        console.error('Error processing auth token:', error);
                        setState({ user: null, loading: false });
                        delete axios.defaults.headers.common.Authorization;
                    }
                }
            }
        });

        // Cleanup function to unsubscribe
        return () => {
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ----------------------------------------------------------------------

    const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

    const status = state.loading ? 'loading' : checkAuthenticated;

    const memoizedValue = useMemo(
        () => ({
            user: state.user
                ? {
                      ...state.user,
                      id: state.user?.id,
                      accessToken: state.user?.access_token,
                      displayName: state.user?.user_metadata.display_name,
                      role: state.user?.role ?? 'authenticated',
                  }
                : null,
            checkUserSession,
            role: state.roles ?? { isAdmin: false, isVip: false, isCorp: false, isPublic: true },
            loading: status === 'loading',
            authenticated: status === 'authenticated',
            unauthenticated: status === 'unauthenticated',
            displayName: state.user?.user_metadata?.display_name ?? undefined,
        }),
        [checkUserSession, state.user, state.roles, status]
    );

    return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
