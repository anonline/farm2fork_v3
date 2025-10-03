import type { IOrderData, PaymentStatus, OrderHistoryEntry } from 'src/types/order-management';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Create a server-side Supabase client with service role for admin operations
 */
async function createAdminClient() {
    const cookieStore = await cookies();
    
    return createServerClient(CONFIG.supabase.url, CONFIG.supabase.service_key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// ----------------------------------------------------------------------

/**
 * Get order by ID - Server-side version for use in server components
 */
export async function getOrderByIdSSR(orderId: string): Promise<{ order: IOrderData | null; error: string | null }> {
    try {
        const supabase = await createAdminClient();
        
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order (SSR):', error);
            return { order: null, error: error.message };
        }

        if (!data) {
            return { order: null, error: 'Order not found' };
        }

        // Transform database fields to match our interface
        const order: IOrderData = {
            id: data.id,
            dateCreated: data.date_created,
            customerId: data.customer_id,
            customerName: data.customer_name,
            billingEmails: data.billing_emails || [],
            notifyEmails: data.notify_emails || [],
            note: data.note || '',
            shippingAddress: data.shipping_address,
            billingAddress: data.billing_address,
            denyInvoice: data.deny_invoice || false,
            needVAT: data.need_vat || false,
            surchargeAmount: data.surcharge_amount || 0,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            shippingCost: data.shipping_cost || 0,
            vatTotal: data.vat_total || 0,
            discountTotal: data.discount_total || 0,
            total: data.total || 0,
            payedAmount: data.payed_amount || 0,
            shippingMethod: data.shipping_method,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status || 'pending',
            orderStatus: data.order_status || 'pending',
            paymentDueDays: data.payment_due_days || 0,
            courier: data.courier,
            plannedShippingDateTime: data.planned_shipping_date_time ? new Date(data.planned_shipping_date_time) : null,
            shipment_time: data.shipment_time || '',
            simplepayDataJson: data.simplepay_data_json,
            invoiceDataJson: data.invoice_data_json,
            history: data.history || [],
            shipmentId: data.shipment_id || null,
        };
        
        return { order, error: null };
    } catch (error) {
        console.error('Error fetching order (SSR):', error);
        return { order: null, error: 'Failed to fetch order' };
    }
}

/**
 * Get all orders - Server-side version for use in server components
 */
export async function getAllOrdersSSR(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
}): Promise<{ orders: IOrderData[]; total: number; error: string | null }> {
    try {
        const supabase = await createAdminClient();
        
        let query = supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .order('date_created', { ascending: false });

        // Apply filters
        if (params?.status && params.status !== 'all') {
            query = query.eq('order_status', params.status);
        }

        if (params?.customerId) {
            query = query.eq('customer_id', params.customerId);
        }

        // Apply pagination
        // Note: Supabase has a default limit of ~1000 rows. To fetch more, we need to handle it specially.
        let data: any[] = [];
        let count = 0;
        let error = null;

        if (params?.page && params?.limit && params.limit < 10000) {
            // Normal pagination for reasonable page sizes
            const from = (params.page - 1) * params.limit;
            const to = from + params.limit - 1;
            query = query.range(from, to);
            console.log(`Fetching orders (SSR) - Page: ${params.page}, Limit: ${params.limit}, From: ${from}, To: ${to}`);
            
            const result = await query;
            data = result.data || [];
            count = result.count || 0;
            error = result.error;
        } else if (params?.limit && params.limit >= 10000) {
            // For very large limits, fetch all records in batches
            console.log(`Fetching ALL orders in batches (requested limit: ${params.limit})`);
            const batchSize = 1000;
            let currentPage = 0;
            let hasMore = true;
            
            while (hasMore) {
                const from = currentPage * batchSize;
                const to = from + batchSize - 1;
                
                const batchQuery = supabase
                    .from('orders')
                    .select('*', { count: currentPage === 0 ? 'exact' : undefined })
                    .order('date_created', { ascending: false });
                
                // Apply same filters
                if (params?.status && params.status !== 'all') {
                    batchQuery.eq('order_status', params.status);
                }
                if (params?.customerId) {
                    batchQuery.eq('customer_id', params.customerId);
                }
                
                batchQuery.range(from, to);
                
                const result = await batchQuery;
                
                if (result.error) {
                    error = result.error;
                    break;
                }
                
                if (currentPage === 0) {
                    count = result.count || 0;
                    console.log(`Total orders available: ${count}`);
                }
                
                if (result.data && result.data.length > 0) {
                    data = [...data, ...result.data];
                    console.log(`Fetched batch ${currentPage + 1}: ${result.data.length} orders (total so far: ${data.length})`);
                    hasMore = result.data.length === batchSize;
                    currentPage++;
                } else {
                    hasMore = false;
                }
            }
            
            console.log(`Finished fetching all orders: ${data.length} total`);
        } else {
            // No pagination, fetch with default limit
            const result = await query;
            data = result.data || [];
            count = result.count || 0;
            error = result.error;
        }

        if (error) { 
            console.error('Error fetching orders (SSR):', error);
            return { orders: [], total: 0, error: error.message };
        }

        // Transform database fields to match our interface
        const orders: IOrderData[] = (data || []).map((row: any) => ({
            id: row.id,
            dateCreated: row.date_created,
            customerId: row.customer_id,
            customerName: row.customer_name,
            billingEmails: row.billing_emails || [],
            notifyEmails: row.notify_emails || [],
            note: row.note || '',
            shippingAddress: row.shipping_address,
            billingAddress: row.billing_address,
            denyInvoice: row.deny_invoice || false,
            needVAT: row.need_vat || false,
            surchargeAmount: row.surcharge_amount || 0,
            items: row.items || [],
            subtotal: row.subtotal || 0,
            shippingCost: row.shipping_cost || 0,
            vatTotal: row.vat_total || 0,
            discountTotal: row.discount_total || 0,
            total: row.total || 0,
            payedAmount: row.payed_amount || 0,
            shippingMethod: row.shipping_method,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status || 'pending',
            orderStatus: row.order_status || 'pending',
            paymentDueDays: row.payment_due_days || 0,
            courier: row.courier,
            plannedShippingDateTime: row.planned_shipping_date_time ? new Date(row.planned_shipping_date_time) : null,
            shipment_time: row.shipment_time || '',
            simplepayDataJson: row.simplepay_data_json,
            invoiceDataJson: row.invoice_data_json,
            history: row.history || [],
            shipmentId: row.shipment_id || null,
        }));

        return { orders, total: count || 0, error: null };
    } catch (error) {
        console.error('Error fetching orders (SSR):', error);
        return { orders: [], total: 0, error: 'Failed to fetch orders' };
    }
}

/**
 * Update order payment status - Server-side version
 */
export async function updateOrderPaymentStatusSSR(
    orderId: string, 
    paymentStatus: PaymentStatus,
    payedAmount?: number
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await createAdminClient();
        
        const updateData: any = {
            payment_status: paymentStatus,
            updated_at: new Date().toISOString(),
        };

        if (payedAmount !== undefined) {
            updateData.payed_amount = payedAmount;
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order payment status (SSR):', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order payment status (SSR):', error);
        return { success: false, error: 'Failed to update order payment status' };
    }
}

/**
 * Update order payment status - Server-side version
 */
export async function updateOrderPaymentSimpleStatusSSR(
    orderId: string, 
    simplepay_data_json: string,

): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await createAdminClient();
        
        const updateData: any = {
            simplepay_data_json,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order payment data (SSR):', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order payment data (SSR):', error);
        return { success: false, error: 'Failed to update order payment data' };
    }
}

export async function addOrderHistorySSR(orderId: string, newHistory: OrderHistoryEntry): Promise<{ success: boolean; error: string | null }> {
    console.log('adding new OrderHistory', orderId, newHistory);

    try {
        const supabase = await createAdminClient();
        
        const { data, error } = await supabase
            .from('orders')
            .select('history')
            .eq('id', orderId);

        if (error) {
            console.error('Error fetching order history:', error);
            return { success: false, error: error.message };
        }
        console.log('existing history:', data);

        const history = data[0]?.history || [];
        history.push(newHistory);

        const { error: updateError } = await supabase
            .from('orders')
            .update({ history })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order history:', updateError);
            return { success: false, error: updateError.message };
        }
        console.log('History updated successfully.');
        return { success: true, error: null };
    } catch (error) {
        console.error('Error adding order history:', error);
        return { success: false, error: 'Failed to add order history' };
    }
}

