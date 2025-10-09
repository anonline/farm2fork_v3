'use server';

import type { IBillingAddress } from 'src/types/customer';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';



const initSupabase = async () => {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
};

/**
 * Invoice data structure from orders.invoice_data_json
 */
export interface InvoiceHistoryItem {
    success: boolean;
    currency: string;
    createdAt: string;
    invoiceId: number;
    partnerId: number;
    downloadUrl: string;
    totalAmount: number;
    invoiceNumber: string;
}

/**
 * Get user billing addresses from CustomerData
 */
export async function getUserBillingAddresses(
    userId: string
): Promise<{ addresses: IBillingAddress[]; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { data, error } = await supabase
            .from('CustomerDatas')
            .select('billingAddress')
            .eq('uid', userId)
            .single();

        if (error) {
            console.error('Error fetching billing addresses:', error);
            return { addresses: [], error: error.message };
        }

        const addresses = (data?.billingAddress || []) as IBillingAddress[];
        return { addresses, error: null };
    } catch (error) {
        console.error('Error fetching billing addresses:', error);
        return { addresses: [], error: 'Failed to fetch billing addresses' };
    }
}

/**
 * Get user invoice history from orders table
 */
export async function getUserInvoiceHistory(
    userId: string
): Promise<{ invoices: InvoiceHistoryItem[]; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { data, error } = await supabase
            .from('orders')
            .select('invoice_data_json')
            .eq('customer_id', userId)
            .not('invoice_data_json', 'is', null)
            .order('date_created', { ascending: false });

        if (error) {
            console.error('Error fetching invoice history:', error);
            return { invoices: [], error: error.message };
        }

        // Extract and filter valid invoice data
        const invoices: InvoiceHistoryItem[] = (data || [])
            .map((order) => order.invoice_data_json)
            .filter((invoice): invoice is InvoiceHistoryItem => 
                invoice !== null && 
                invoice !== undefined && 
                typeof invoice === 'object' &&
                'invoiceNumber' in invoice
            );

        return { invoices, error: null };
    } catch (error) {
        console.error('Error fetching invoice history:', error);
        return { invoices: [], error: 'Failed to fetch invoice history' };
    }
}

/**
 * Update user billing addresses
 */
export async function updateUserBillingAddresses(
    userId: string,
    addresses: IBillingAddress[]
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { error } = await supabase
            .from('CustomerDatas')
            .update({ billingAddress: addresses })
            .eq('uid', userId);

        if (error) {
            console.error('Error updating billing addresses:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating billing addresses:', error);
        return { success: false, error: 'Failed to update billing addresses' };
    }
}

/**
 * Add a new billing address for a user
 */
export async function addUserBillingAddress(
    userId: string,
    address: IBillingAddress
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await initSupabase();
        // Get current addresses
        const { addresses, error: fetchError } = await getUserBillingAddresses(userId);
        
        if (fetchError) {
            return { success: false, error: fetchError };
        }

        // If this is set as default, unset other defaults
        const updatedAddresses = address.isDefault
            ? addresses.map((addr) => ({ ...addr, isDefault: false }))
            : addresses;

        // Add new address with a generated ID
        const newAddress = {
            ...address,
            id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        updatedAddresses.push(newAddress);

        // Update in database
        return await updateUserBillingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error adding billing address:', error);
        return { success: false, error: 'Failed to add billing address' };
    }
}

/**
 * Update an existing billing address
 */
export async function editUserBillingAddress(
    userId: string,
    addressId: string,
    updatedAddress: Partial<IBillingAddress>
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await initSupabase();
        // Get current addresses
        const { addresses, error: fetchError } = await getUserBillingAddresses(userId);
        
        if (fetchError) {
            return { success: false, error: fetchError };
        }

        // Find and update the address
        const addressIndex = addresses.findIndex((addr) => addr.id === addressId);
        
        if (addressIndex === -1) {
            return { success: false, error: 'Address not found' };
        }

        // If this is being set as default, unset other defaults
        let updatedAddresses = [...addresses];
        
        if (updatedAddress.isDefault) {
            updatedAddresses = updatedAddresses.map((addr) => 
                addr.id === addressId ? addr : { ...addr, isDefault: false }
            );
        }

        // Update the specific address
        updatedAddresses[addressIndex] = {
            ...updatedAddresses[addressIndex],
            ...updatedAddress,
        };

        // Update in database
        return await updateUserBillingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error editing billing address:', error);
        return { success: false, error: 'Failed to edit billing address' };
    }
}

/**
 * Delete a billing address
 */
export async function deleteUserBillingAddress(
    userId: string,
    addressId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current addresses
        const { addresses, error: fetchError } = await getUserBillingAddresses(userId);
        
        if (fetchError) {
            return { success: false, error: fetchError };
        }

        // Filter out the address to delete
        const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);

        // Update in database
        return await updateUserBillingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error deleting billing address:', error);
        return { success: false, error: 'Failed to delete billing address' };
    }
}
