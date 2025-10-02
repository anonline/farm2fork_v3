'use client';

import type { WPTransferUser } from 'src/types/woocommerce/user';
import type { ICustomerData, IBillingAddress, IDeliveryAddress } from 'src/types/customer';
import type {
    AuthError,
    AuthResponse,
    UserResponse,
    AuthTokenResponsePassword,
    SignInWithPasswordCredentials,
    SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

import { paths } from 'src/routes/paths';

import wpHashPassword from 'src/utils/wplogin';
import { removeSupabaseAuthCookies } from 'src/utils/cookie-utils';

import { supabase } from 'src/lib/supabase';
import { createUserRolesSSR, createCustomerDataSSR, getUserByEmailAdmin, setUserPassword } from 'src/actions/user-ssr';

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

export const signInWithWordpress = async ({
    email,
    password,
}: SignInParams): Promise<boolean> => {

    const { data, error } = await supabase.from('wp_users').select('*').eq('email', email).eq('closed', false).single();

    if (error) {
        console.error(error);
        throw error;
    }
    if (!data) {
        return false;
    }

    const { valid } = wpHashPassword(password, data.password);

    if (!valid) {
        return false;
    }

    await setUserPassword(data.uid, password);
    await signInWithPassword({ email, password });
    return true;
/*
    const { data: dataReg, error: errorReg } = await signUp({ email: data.email, password, firstName: data.firstname, lastName: data.lastname });

    if (errorReg) {
        console.error(errorReg);
        return false;
    }

    if (!dataReg?.user?.identities?.length) {
        return false;
    }

    const { error: updateError } = await supabase
        .from('wp_users')
        .update({ uid: dataReg.user.id, closed: true })
        .eq('id', data.id);

    if (updateError) {
        console.error('Failed to update wp_users with uid:', updateError);
        return false;
    }

    const wpUser = data as WPTransferUser;
    wpUser.uid = dataReg.user.id;

    let isVIP = false;
    let isCompany = false;
    let isAdmin = false;
    let discountPercent = 0;

    if (wpUser.roles) {
        isVIP = wpUser.roles['vsrl_-_vip'] || false;
        isCompany = wpUser.roles.Company_Customer || false;
        isAdmin = wpUser.roles.administrator || false;
        if (wpUser.roles.minus5percent) discountPercent = 5;
        if (wpUser.roles.minus10percent) discountPercent = 10;
        if (wpUser.roles.minus15percent) discountPercent = 15;
        if (wpUser.roles.minus20percent) discountPercent = 20;
        if (wpUser.roles.minus25percent) discountPercent = 25;
        if (wpUser.roles.minus30percent) discountPercent = 30;
        if (wpUser.roles.minus50percent) discountPercent = 50;
    }

    await createUserRolesSSR({ uid: dataReg.user.id, is_admin: isAdmin, is_vip: isVIP, is_corp: isCompany });

    const collectedBillingAddresses: IBillingAddress[] = [];
    if (wpUser.billingaddresses) {
        wpUser.billingaddresses.forEach((address, index) => {
            const billingAddress: IBillingAddress = {
                id: '',
                city: address.city,
                phone: address.phone,
                email: wpUser.email,
                fullName: [address.last_name, address.first_name].join(' ').trim(),
                postcode: address.postcode,
                street: address.address_1 + (address.address_2 ? ' ' + address.address_2 : ''),
                houseNumber: '',
                taxNumber: address.vat,
                doorbell: address.ring || '',
                isDefault: index == 0,
                type: 'billing',
            }

            collectedBillingAddresses.push(billingAddress);
        });
    }

    const collectedShippingAddresses: IDeliveryAddress[] = [];
    if (wpUser.shippingaddresses) {
        wpUser.shippingaddresses.forEach((address, index) => {
            const shippingAddress: IDeliveryAddress = {
                id: address.sid,
                companyName: address.company || '',
                city: address.city,
                phone: address.phone,
                fullName: [address.last_name, address.first_name].join(' ').trim(),
                street: address.address_1 + (address.address_2 ? ' ' + address.address_2 : ''),
                houseNumber: address.houseNumber || '',
                doorbell: address.doorbell || '',
                isDefault: index == 0,
                type: 'shipping',
                comment: address.note || '',
                floor: '',
                postcode: address.postcode || '',
            }

            collectedShippingAddresses.push(shippingAddress);
        });
    }

    const customerData = {
        created_at: new Date().toISOString(),
        uid: dataReg.user.id,
        firstname: wpUser.firstname || '',
        lastname: wpUser.lastname || '',
        companyName: wpUser.company || '',
        isCompany,
        newsletterConsent: !!wpUser.mailchimpid,
        billingAddress: collectedBillingAddresses,
        deliveryAddress: collectedShippingAddresses,
        acquisitionSource: wpUser.from || '',
        paymentDue: wpUser.invoicedue || 0,
        discountPercent,
        mailchimpId: wpUser.mailchimpid || '',
    } as Partial<ICustomerData>;

    await createCustomerDataSSR(customerData);
    await signInWithPassword({ email, password });
    return true;
    */

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
            data: { display_name: `${lastName} ${firstName}` },
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


const easyPassword = Array.from({ length: 8 }, () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
}).join('');

export const initWpUsers = async (): Promise<boolean> => {
    const { data, error } = await supabase.from('wp_users').select('*').eq('closed', false);

    if (error) {
        console.error(error);
        throw error;
    }
    if (!data) {
        return false;
    }

    data.forEach(async (wpUser : WPTransferUser) => {
        const { data: dataReg, error: errorReg } = await signUp({ email: wpUser.email, password: easyPassword, firstName: wpUser.firstname || '', lastName: wpUser.lastname || '' });

        if (errorReg) {
            console.error(errorReg);
            return false;
        }

        if (!dataReg?.user?.identities?.length) {
            return false;
        }

        const { error: updateError } = await supabase
            .from('wp_users')
            .update({ uid: dataReg.user.id, closed: true })
            .eq('id', wpUser.id);

        if (updateError) {
            console.error('Failed to update wp_users with uid:', updateError);
            return false;
        }

        wpUser.uid = dataReg.user.id;

        let isVIP = false;
        let isCompany = false;
        let isAdmin = false;
        let discountPercent = 0;

        if (wpUser.roles) {
            isVIP = wpUser.roles['vsrl_-_vip'] || false;
            isCompany = wpUser.roles.Company_Customer || false;
            isAdmin = wpUser.roles.administrator || false;
            if (wpUser.roles.minus5percent) discountPercent = 5;
            if (wpUser.roles.minus10percent) discountPercent = 10;
            if (wpUser.roles.minus15percent) discountPercent = 15;
            if (wpUser.roles.minus20percent) discountPercent = 20;
            if (wpUser.roles.minus25percent) discountPercent = 25;
            if (wpUser.roles.minus30percent) discountPercent = 30;
            if (wpUser.roles.minus50percent) discountPercent = 50;
        }

        await createUserRolesSSR({ uid: dataReg.user.id, is_admin: isAdmin, is_vip: isVIP, is_corp: isCompany });

        const collectedBillingAddresses: IBillingAddress[] = [];
        if (wpUser.billingaddresses) {
            wpUser.billingaddresses.forEach((address, index) => {
                const billingAddress: IBillingAddress = {
                    id: '',
                    city: address.city,
                    phone: address.phone,
                    email: wpUser.email,
                    fullName: [address.last_name, address.first_name].join(' ').trim(),
                    postcode: address.postcode,
                    street: address.address_1 + (address.address_2 ? ' ' + address.address_2 : ''),
                    houseNumber: '',
                    taxNumber: address.vat,
                    doorbell: address.ring || '',
                    isDefault: index == 0,
                    type: 'billing',
                }

                collectedBillingAddresses.push(billingAddress);
            });
        }

        const collectedShippingAddresses: IDeliveryAddress[] = [];
        if (wpUser.shippingaddresses) {
            wpUser.shippingaddresses.forEach((address, index) => {
                const shippingAddress: IDeliveryAddress = {
                    id: address.sid,
                    companyName: address.company || '',
                    city: address.city,
                    phone: address.phone,
                    fullName: [address.last_name, address.first_name].join(' ').trim(),
                    street: address.address_1 + (address.address_2 ? ' ' + address.address_2 : ''),
                    houseNumber: address.houseNumber || '',
                    doorbell: address.doorbell || '',
                    isDefault: index == 0,
                    type: 'shipping',
                    comment: address.note || '',
                    floor: '',
                    postcode: address.postcode || '',
                }

                collectedShippingAddresses.push(shippingAddress);
            });
        }

        const customerData = {
            created_at: new Date().toISOString(),
            uid: dataReg.user.id,
            firstname: wpUser.firstname || '',
            lastname: wpUser.lastname || '',
            companyName: wpUser.company || '',
            isCompany,
            newsletterConsent: !!wpUser.mailchimpid,
            billingAddress: collectedBillingAddresses,
            deliveryAddress: collectedShippingAddresses,
            acquisitionSource: wpUser.from || '',
            paymentDue: wpUser.invoicedue || 0,
            discountPercent,
            mailchimpId: wpUser.mailchimpid || '',
        } as Partial<ICustomerData>;

        await createCustomerDataSSR(customerData);
    });

    return true;
};