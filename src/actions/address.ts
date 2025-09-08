import type { IAddress, IAddressData, IBillingAddress, IShippingAddress } from 'src/types/address';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

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
                shippingAddresses,
                billingAddresses,
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

    // If new address is default, make others non-default
    if (newAddress.isDefault) {
        if (newAddress.type === 'shipping') {
            currentShipping = currentShipping.map((addr) => ({ ...addr, isDefault: false }));
        } else {
            currentBilling = currentBilling.map((addr) => ({ ...addr, isDefault: false }));
        }
    }

    // Add new address to appropriate array
    if (newAddress.type === 'shipping') {
        currentShipping.push(newAddress as IShippingAddress);
    } else {
        currentBilling.push(newAddress as IBillingAddress);
    }

    // Update database
    const { error } = await supabase
        .from('CustomerDatas')
        .upsert({
            uid,
            deliveryAddress: JSON.stringify(currentShipping),
            billingAddress: JSON.stringify(currentBilling),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

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
        currentShipping[shippingIndex] = { ...currentShipping[shippingIndex], ...updates } as IShippingAddress;
        
        // If updated address is set as default, make others non-default
        if (updates.isDefault) {
            currentShipping = currentShipping.map((addr, index) => ({
                ...addr,
                isDefault: index === shippingIndex,
            }));
        }
    } else if (billingIndex >= 0) {
        currentBilling[billingIndex] = { ...currentBilling[billingIndex], ...updates } as IBillingAddress;
        
        // If updated address is set as default, make others non-default
        if (updates.isDefault) {
            currentBilling = currentBilling.map((addr, index) => ({
                ...addr,
                isDefault: index === billingIndex,
            }));
        }
    } else {
        throw new Error('Address not found');
    }

    // Update database
    const { error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress: JSON.stringify(currentShipping),
            billingAddress: JSON.stringify(currentBilling),
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
    currentShipping = currentShipping.filter((addr) => addr.id !== addressId);
    currentBilling = currentBilling.filter((addr) => addr.id !== addressId);

    // Update database
    const { error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress: JSON.stringify(currentShipping),
            billingAddress: JSON.stringify(currentBilling),
        })
        .eq('uid', uid);

    if (error) throw new Error(error.message);

    return {
        shippingAddresses: currentShipping,
        billingAddresses: currentBilling,
    };
}