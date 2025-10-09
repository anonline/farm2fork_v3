'use server';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

const initSupabase = async () => {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
};

/**
 * Order item structure for user orders list
 */
export interface UserOrderItem {
    id: string;
    orderNumber: string;
    dateCreated: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: {
        id: number;
        name: string;
    } | null;
    shippingMethod: {
        id: number;
        name: string;
    } | null;
    subtotal: number;
    total: number;
}

/**
 * Get user orders from orders table
 */
export async function getUserOrders(
    userId: string
): Promise<{ orders: UserOrderItem[]; error: string | null }> {
    try {
        const supabase = await initSupabase();
        const { data, error } = await supabase
            .from('orders')
            .select('id, date_created, order_status, payment_status, payment_method, shipping_method, subtotal, total')
            .eq('customer_id', userId)
            .order('date_created', { ascending: false });

        if (error) {
            console.error('Error fetching user orders:', error);
            return { orders: [], error: error.message };
        }

        // Transform the data to match our interface
        const orders: UserOrderItem[] = (data || []).map((order) => ({
            id: order.id,
            orderNumber: order.id,
            dateCreated: order.date_created,
            orderStatus: order.order_status || 'pending',
            paymentStatus: order.payment_status || 'pending',
            paymentMethod: order.payment_method,
            shippingMethod: order.shipping_method,
            subtotal: order.subtotal || 0,
            total: order.total || 0,
        }));

        return { orders, error: null };
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        return { orders: [], error: 'Hiba történt a rendelések betöltése során.' };
    }
}
