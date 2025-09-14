import type { IAddress, IAddressData, IBillingAddress, IShippingAddress } from 'src/types/address';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

// Helper function to ensure proper default address handling
function ensureDefaultAddress<T extends { isDefault?: boolean }>(addresses: T[]): T[] {
    if (addresses.length === 0) return addresses;
    
    const hasDefault = addresses.some(addr => addr.isDefault);
    
    if (!hasDefault) {
        // Make the first address default if none is set
        return addresses.map((addr, index) => ({
            ...addr,
            isDefault: index === 0
        }));
    }
    
    return addresses;
}

// ----------------------------------------------------------------------

export function useGetAddresses(uid?: string) {
    const SWR_KEY = uid ? `addresses-${uid}` : null;

    const { data, isLoading, error, mutate } = useSWR(
        SWR_KEY,
        async () => {
            if (!uid) return null;

            const { data: customerData, error: dbError } = await supabase
                .from('CustomerDatas')
                .select('deliveryAddress, billingAddress')
                .eq('uid', uid)
                .single();

            if (dbError) {
                // If no customer data found, return empty structure
                if (dbError.code === 'PGRST116') {
                    return {
                        shippingAddresses: [],
                        billingAddresses: [],
                    } as IAddressData;
                }
                throw new Error(dbError.message);
            }

            // Parse the JSON addresses
            let shippingAddresses: IShippingAddress[] = [];
            let billingAddresses: IBillingAddress[] = [];

            if (customerData.deliveryAddress) {
                try {
                    const parsed =
                        typeof customerData.deliveryAddress === 'string'
                            ? JSON.parse(customerData.deliveryAddress)
                            : customerData.deliveryAddress;
                    shippingAddresses = Array.isArray(parsed) ? parsed : [];
                } catch (parseError) {
                    console.error('Error parsing delivery addresses:', parseError);
                    shippingAddresses = [];
                }
            }

            if (customerData.billingAddress) {
                try {
                    const parsed =
                        typeof customerData.billingAddress === 'string'
                            ? JSON.parse(customerData.billingAddress)
                            : customerData.billingAddress;
                    billingAddresses = Array.isArray(parsed) ? parsed : [];
                } catch (parseError) {
                    console.error('Error parsing billing addresses:', parseError);
                    billingAddresses = [];
                }
            }

            return {
                shippingAddresses: ensureDefaultAddress(shippingAddresses),
                billingAddresses: ensureDefaultAddress(billingAddresses),
            } as IAddressData;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return useMemo(
        () => ({
            addresses: data,
            addressesLoading: isLoading,
            addressesError: error,
            addressesMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

// ----------------------------------------------------------------------

export async function addAddress(uid: string, address: IAddress): Promise<IAddressData> {
    // Get current addresses
    const { data: customerData, error: fetchError } = await supabase
        .from('CustomerDatas')
        .select('deliveryAddress, billingAddress')
        .eq('uid', uid)
        .single();

    let currentShipping: IShippingAddress[] = [];
    let currentBilling: IBillingAddress[] = [];

    if (!fetchError && customerData) {
        // Parse existing addresses
        if (customerData.deliveryAddress) {
            try {
                const parsed =
                    typeof customerData.deliveryAddress === 'string'
                        ? JSON.parse(customerData.deliveryAddress)
                        : customerData.deliveryAddress;
                currentShipping = Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
                console.error('Error parsing existing delivery addresses:', parseError);
            }
        }

        if (customerData.billingAddress) {
            try {
                const parsed =
                    typeof customerData.billingAddress === 'string'
                        ? JSON.parse(customerData.billingAddress)
                        : customerData.billingAddress;
                currentBilling = Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
                console.error('Error parsing existing billing addresses:', parseError);
            }
        }
    }

    // Add ID to the new address
    const newAddress = { ...address, id: `${Date.now()}-${Math.random()}` };

    // Handle default address logic
    if (newAddress.type === 'shipping') {
        // If new address is default, make all others non-default
        if (newAddress.isDefault) {
            currentShipping = currentShipping.map((addr) => ({ ...addr, isDefault: false }));
        } else {
            // If no default exists and this is the first address, make it default
            const hasDefault = currentShipping.some((addr) => addr.isDefault);
            if (!hasDefault && currentShipping.length === 0) {
                newAddress.isDefault = true;
            }
        }
        currentShipping.push(newAddress as IShippingAddress);
    } else {
        // If new address is default, make all others non-default
        if (newAddress.isDefault) {
            currentBilling = currentBilling.map((addr) => ({ ...addr, isDefault: false }));
        } else {
            // If no default exists and this is the first address, make it default
            const hasDefault = currentBilling.some((addr) => addr.isDefault);
            if (!hasDefault && currentBilling.length === 0) {
                newAddress.isDefault = true;
            }
        }
        currentBilling.push(newAddress as IBillingAddress);
    }

    // Update database - use update instead of upsert to avoid creating duplicate rows
    const { error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress: currentShipping,
            billingAddress: currentBilling,
        })
        .eq('uid', uid);

    // If no rows were updated (customer record doesn't exist), create one
    if (error?.code === 'PGRST116' || (error?.message?.includes('0 rows') && !fetchError)) {
        const { error: insertError } = await supabase
            .from('CustomerDatas')
            .insert({
                uid,
                deliveryAddress: currentShipping,
                billingAddress: currentBilling,
            });
        
        if (insertError) throw new Error(insertError.message);
    } else if (error) {
        throw new Error(error.message);
    }

    return {
        shippingAddresses: currentShipping,
        billingAddresses: currentBilling,
    };
}

// ----------------------------------------------------------------------

export async function updateAddress(uid: string, addressId: string, updates: Partial<IAddress>): Promise<IAddressData> {
    // Get current addresses
    const { data: customerData, error: fetchError } = await supabase
        .from('CustomerDatas')
        .select('deliveryAddress, billingAddress')
        .eq('uid', uid)
        .single();

    if (fetchError) throw new Error(fetchError.message);

    let currentShipping: IShippingAddress[] = [];
    let currentBilling: IBillingAddress[] = [];

    // Parse existing addresses
    if (customerData.deliveryAddress) {
        try {
            const parsed =
                typeof customerData.deliveryAddress === 'string'
                    ? JSON.parse(customerData.deliveryAddress)
                    : customerData.deliveryAddress;
            currentShipping = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
            console.error('Error parsing existing delivery addresses:', parseError);
        }
    }

    if (customerData.billingAddress) {
        try {
            const parsed =
                typeof customerData.billingAddress === 'string'
                    ? JSON.parse(customerData.billingAddress)
                    : customerData.billingAddress;
            currentBilling = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
            console.error('Error parsing existing billing addresses:', parseError);
        }
    }

    // Find and update the address
    const shippingIndex = currentShipping.findIndex((addr) => addr.id === addressId);
    const billingIndex = currentBilling.findIndex((addr) => addr.id === addressId);

    if (shippingIndex >= 0) {
        // If setting this address as default, make all others non-default
        if (updates.isDefault) {
            currentShipping = currentShipping.map((addr, index) => ({
                ...addr,
                isDefault: index === shippingIndex,
            }));
        }
        
        // Update the address
        currentShipping[shippingIndex] = { ...currentShipping[shippingIndex], ...updates } as IShippingAddress;
        
        // If unsetting default (isDefault: false), ensure at least one is default
        if (updates.hasOwnProperty('isDefault') && !updates.isDefault) {
            const hasOtherDefault = currentShipping.some((addr, index) => index !== shippingIndex && addr.isDefault);
            if (!hasOtherDefault && currentShipping.length > 0) {
                // Make the first address default if no other default exists
                currentShipping[0].isDefault = true;
            }
        }
    } else if (billingIndex >= 0) {
        // If setting this address as default, make all others non-default
        if (updates.isDefault) {
            currentBilling = currentBilling.map((addr, index) => ({
                ...addr,
                isDefault: index === billingIndex,
            }));
        }
        
        // Update the address
        currentBilling[billingIndex] = { ...currentBilling[billingIndex], ...updates } as IBillingAddress;
        
        // If unsetting default (isDefault: false), ensure at least one is default
        if (updates.hasOwnProperty('isDefault') && !updates.isDefault) {
            const hasOtherDefault = currentBilling.some((addr, index) => index !== billingIndex && addr.isDefault);
            if (!hasOtherDefault && currentBilling.length > 0) {
                // Make the first address default if no other default exists
                currentBilling[0].isDefault = true;
            }
        }
    } else {
        throw new Error('Address not found');
    }

    // Update database
    const { error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress: currentShipping,
            billingAddress: currentBilling,
        })
        .eq('uid', uid);

    if (error) throw new Error(error.message);

    return {
        shippingAddresses: currentShipping,
        billingAddresses: currentBilling,
    };
}

// ----------------------------------------------------------------------

export async function deleteAddress(uid: string, addressId: string): Promise<IAddressData> {
    // Get current addresses
    const { data: customerData, error: fetchError } = await supabase
        .from('CustomerDatas')
        .select('deliveryAddress, billingAddress')
        .eq('uid', uid)
        .single();

    if (fetchError) throw new Error(fetchError.message);

    let currentShipping: IShippingAddress[] = [];
    let currentBilling: IBillingAddress[] = [];

    // Parse existing addresses
    if (customerData.deliveryAddress) {
        try {
            const parsed =
                typeof customerData.deliveryAddress === 'string'
                    ? JSON.parse(customerData.deliveryAddress)
                    : customerData.deliveryAddress;
            currentShipping = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
            console.error('Error parsing existing delivery addresses:', parseError);
        }
    }

    if (customerData.billingAddress) {
        try {
            const parsed =
                typeof customerData.billingAddress === 'string'
                    ? JSON.parse(customerData.billingAddress)
                    : customerData.billingAddress;
            currentBilling = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
            console.error('Error parsing existing billing addresses:', parseError);
        }
    }

    // Remove the address
    const deletedShippingIndex = currentShipping.findIndex((addr) => addr.id === addressId);
    const deletedBillingIndex = currentBilling.findIndex((addr) => addr.id === addressId);
    
    currentShipping = currentShipping.filter((addr) => addr.id !== addressId);
    currentBilling = currentBilling.filter((addr) => addr.id !== addressId);

    // If we deleted a default address, ensure we still have a default
    if (deletedShippingIndex >= 0 && currentShipping.length > 0) {
        const hasDefault = currentShipping.some(addr => addr.isDefault);
        if (!hasDefault) {
            currentShipping[0].isDefault = true;
        }
    }
    
    if (deletedBillingIndex >= 0 && currentBilling.length > 0) {
        const hasDefault = currentBilling.some(addr => addr.isDefault);
        if (!hasDefault) {
            currentBilling[0].isDefault = true;
        }
    }

    // Update database
    const { error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress: currentShipping,
            billingAddress: currentBilling,
        })
        .eq('uid', uid);

    if (error) throw new Error(error.message);

    return {
        shippingAddresses: currentShipping,
        billingAddresses: currentBilling,
    };
}