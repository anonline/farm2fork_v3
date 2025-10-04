import type { ICustomerData } from 'src/types/customer';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

export function useGetCustomerData(uid?: string) {
    const SWR_KEY = uid ? `customerData-${uid}` : null;

    const { data, isLoading, error, mutate } = useSWR(
        SWR_KEY,
        async () => {
            if (!uid) return null;

            const { data: customerData, error: dbError } = await supabase
                .from('CustomerDatas')
                .select('*')
                .eq('uid', uid)
                .single();

            if (dbError) {
                // If no customer data found, return empty structure
                if (dbError.code === 'PGRST116') {
                    return null;
                }
                throw new Error(dbError.message);
            }

            // Parse the JSON delivery addresses
            let deliveryAddress = null;
            if (customerData.deliveryAddress) {
                try {
                    deliveryAddress =
                        typeof customerData.deliveryAddress === 'string'
                            ? JSON.parse(customerData.deliveryAddress)
                            : customerData.deliveryAddress;
                    
                    // Ensure all addresses have IDs and type (for backward compatibility)
                    if (Array.isArray(deliveryAddress)) {
                        deliveryAddress = deliveryAddress.map((addr: any) => ({
                            ...addr,
                            id: addr.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: addr.type || 'shipping', // Default to 'shipping' for existing addresses
                        }));
                    }
                } catch (parseError) {
                    console.error('Error parsing delivery addresses:', parseError);
                    deliveryAddress = [];
                }
            }

            // Parse the JSON billing addresses
            let billingAddress = null;
            if (customerData.billingAddress) {
                try {
                    billingAddress =
                        typeof customerData.billingAddress === 'string'
                            ? JSON.parse(customerData.billingAddress)
                            : customerData.billingAddress;
                    
                    // Ensure all billing addresses have IDs and type (for backward compatibility)
                    if (Array.isArray(billingAddress)) {
                        billingAddress = billingAddress.map((addr: any) => ({
                            ...addr,
                            id: addr.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: 'billing', // Always set to 'billing' for billing addresses
                        }));
                    }
                } catch (parseError) {
                    console.error('Error parsing billing addresses:', parseError);
                    billingAddress = [];
                }
            }

            return {
                ...customerData,
                deliveryAddress,
                billingAddress,
            } as ICustomerData;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return useMemo(
        () => ({
            customerData: data,
            customerDataLoading: isLoading,
            customerDataError: error,
            customerDataMutate: mutate,
        }),
        [data, error, isLoading, mutate]
    );
}

export async function updateCustomerDeliveryAddress(uid: string, deliveryAddress: any[]) {
    const { data, error } = await supabase
        .from('CustomerDatas')
        .update({
            deliveryAddress,
        })
        .eq('uid', uid)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateCustomerBillingAddress(uid: string, billingAddress: any[]) {
    const { data, error } = await supabase
        .from('CustomerDatas')
        .update({
            billingAddress,
        })
        .eq('uid', uid)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateCustomerData(uid: string, updates: Partial<ICustomerData>) {
    const { data, error } = await supabase
        .from('CustomerDatas')
        .update(updates)
        .eq('uid', uid)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
