'use client';

import type {
    AuthError,
    AuthResponse,
    UserResponse,
    AuthTokenResponsePassword,
    SignInWithPasswordCredentials,
    SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

import { removeSupabaseAuthCookies } from 'src/utils/cookie-utils';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export type SignInParams = {
    email: string;
    password: string;
    options?: SignInWithPasswordCredentials['options'];
};

export type SignUpParams = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    options?: SignUpWithPasswordCredentials['options'];
};

export type ResetPasswordParams = {
    email: string;
    options?: {
        redirectTo?: string;
        captchaToken?: string;
    };
};

export type UpdatePasswordParams = {
    password: string;
    options?: {
        emailRedirectTo?: string | undefined;
    };
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({
    email,
    password,
}: SignInParams): Promise<AuthTokenResponsePassword> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error(error);
        throw error;
    }

    return { data, error };
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
    email,
    password,
    firstName,
    lastName,
}: SignUpParams): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}${paths.dashboard.root}`,
            data: { display_name: `${firstName} ${lastName}` },
        },
    });

    if (error) {
        console.error(error);
        throw error;
    }

    if (!data?.user?.identities?.length) {
        throw new Error('This user already exists');
    }

    return { data, error };
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<{
    error: AuthError | null;
}> => {
    try {
        // Check if there's an active session before attempting to sign out
        const {
            data: { session },
        } = await supabase.auth.getSession();

        // If no session exists, consider the logout successful
        if (!session) {
            // Still remove any remaining auth cookies
            removeSupabaseAuthCookies();
            return { error: null };
        }

        const { error } = await supabase.auth.signOut();

        // Remove all Supabase auth token cookies regardless of signOut result
        removeSupabaseAuthCookies();

        if (error) {
            // Handle specific auth session missing error gracefully
            if (error.message?.includes('Auth session missing')) {
                console.warn('No active session to sign out from');
                return { error: null };
            }
            console.error(error);
            throw error;
        }

        return { error };
    } catch (error) {
        // Remove cookies even if there's an error
        removeSupabaseAuthCookies();
        
        // Handle any other errors gracefully
        if (error instanceof Error && error.message?.includes('Auth session missing')) {
            console.warn('No active session to sign out from');
            return { error: null };
        }
        console.error('Unexpected error during sign out:', error);
        throw error;
    }
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({
    email,
}: ResetPasswordParams): Promise<{ data: {}; error: null } | { data: null; error: AuthError }> => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${paths.auth.supabase.updatePassword}`,
    });

    if (error) {
        console.error(error);
        throw error;
    }

    return { data, error };
};

/** **************************************
 * Update password
 *************************************** */
export const updatePassword = async ({ password }: UpdatePasswordParams): Promise<UserResponse> => {
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error(error);
        throw error;
    }

    return { data, error };
};
