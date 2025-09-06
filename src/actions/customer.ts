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
                } catch (parseError) {
                    console.error('Error parsing delivery addresses:', parseError);
                    deliveryAddress = [];
                }
            }

            return {
                ...customerData,
                deliveryAddress,
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
        .upsert({
            uid,
            deliveryAddress: JSON.stringify(deliveryAddress),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}
