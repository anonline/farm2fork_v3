'use server';

import type { IDeliveryAddress } from 'src/types/customer';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

const initSupabase = async () => {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
};

/**
 * Get user shipping/delivery addresses from CustomerData
 */
export async function getUserShippingAddresses(
    userId: string
): Promise<{ addresses: IDeliveryAddress[]; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { data, error } = await supabase
            .from('CustomerDatas')
            .select('deliveryAddress')
            .eq('uid', userId)
            .single();

        if (error) {
            console.error('Error fetching shipping addresses:', error);
            return { addresses: [], error: error.message };
        }

        const addresses = (data?.deliveryAddress || []) as IDeliveryAddress[];
        return { addresses, error: null };
    } catch (error) {
        console.error('Error fetching shipping addresses:', error);
        return { addresses: [], error: 'Failed to fetch shipping addresses' };
    }
}

/**
 * Update user shipping addresses
 */
export async function updateUserShippingAddresses(
    userId: string,
    addresses: IDeliveryAddress[]
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { error } = await supabase
            .from('CustomerDatas')
            .update({ deliveryAddress: addresses })
            .eq('uid', userId);

        if (error) {
            console.error('Error updating shipping addresses:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating shipping addresses:', error);
        return { success: false, error: 'Failed to update shipping addresses' };
    }
}

/**
 * Add a new shipping address for a user
 */
export async function addUserShippingAddress(
    userId: string,
    address: IDeliveryAddress
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current addresses
        const { addresses, error: fetchError } = await getUserShippingAddresses(userId);
        
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
        return await updateUserShippingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error adding shipping address:', error);
        return { success: false, error: 'Failed to add shipping address' };
    }
}

/**
 * Update an existing shipping address
 */
export async function editUserShippingAddress(
    userId: string,
    addressId: string,
    updatedAddress: Partial<IDeliveryAddress>
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current addresses
        const { addresses, error: fetchError } = await getUserShippingAddresses(userId);
        
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
        return await updateUserShippingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error editing shipping address:', error);
        return { success: false, error: 'Failed to edit shipping address' };
    }
}

/**
 * Delete a shipping address
 */
export async function deleteUserShippingAddress(
    userId: string,
    addressId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current addresses
        const { addresses, error: fetchError } = await getUserShippingAddresses(userId);
        
        if (fetchError) {
            return { success: false, error: fetchError };
        }

        // Filter out the address to delete
        const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);

        // Update in database
        return await updateUserShippingAddresses(userId, updatedAddresses);
    } catch (error) {
        console.error('Error deleting shipping address:', error);
        return { success: false, error: 'Failed to delete shipping address' };
    }
}
