import type { IShipment } from 'src/types/shipments';
import type { IOrderData, IOrderItem, OrderStatus, PaymentStatus, OrderHistoryEntry } from 'src/types/order-management';

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
            history_for_user: data.history_for_user || '',
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

export async function updateOrderStatusSSR(
    orderId: string,
    orderStatus: OrderStatus
): Promise<{ success: boolean; error: string | null }> {
    try {
        const supabase = await createAdminClient();

        const { error } = await supabase
            .from('orders')
            .update({ 
                order_status: orderStatus,
                updated_at: new Date().toISOString(),
             })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status (SSR):', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order status (SSR):', error);
        return { success: false, error: 'Failed to update order status' };
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

export async function handleStockReductionForOrderSSR(orderId: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createAdminClient();

    const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('id, items')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error('Error fetching order for stock reduction (SSR):', fetchError);
        return { success: false, error: 'Failed to fetch order for stock reduction' };
    }

    if (!orderData) {
        return { success: false, error: 'Order not found' };
    }

    // Reduce stock for each item in the order
    // Collect all product IDs first
    const productIds = orderData.items.map((item:IOrderItem) => item.id);
    
    // Fetch all products in a single query
    const { data: productsData, error: productsFetchError } = await supabase
        .from('Products')
        .select('id, stock, backorder')
        .in('id', productIds);

    if (productsFetchError) {
        console.error('Error fetching products for stock reduction (SSR):', productsFetchError);
        return { success: false, error: 'Failed to fetch products for stock reduction' };
    }

    // Create a map of product ID to product data for quick lookup
    const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);

    // Prepare bulk updates
    const updates: Array<{ id: string; stock: number }> = [];

    for (const item of orderData.items) {
        const productData = productsMap.get(item.id);

        if (!productData) {
            continue; // Product not found, skip
        }

        if (productData.stock === null) {
            continue; // Stock is null, skip
        }

        if (!productData.backorder && productData.stock === 0) {
            continue; // No stock and no backorder allowed, skip
        }

        const newStock = productData.stock - item.quantity;
        updates.push({ id: item.id, stock: newStock });
    }

    // Perform bulk update if there are any updates
    if (updates.length > 0) {
        for (const update of updates) {
            const { error: stockUpdateError } = await supabase
                .from('Products')
                .update({ stock: update.stock })
                .eq('id', update.id);

            if (stockUpdateError) {
                console.error('Error updating product stock (SSR):', stockUpdateError);
                return { success: false, error: 'Failed to update product stock' };
            }
        }
    }

    return { success: true, error: null };
}

export async function revertStockReductionForOrderSSR(orderId: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createAdminClient();

    const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('id, items')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error('Error fetching order for stock reduction revert (SSR):', fetchError);
        return { success: false, error: 'Failed to fetch order for stock reduction revert' };
    }

    if (!orderData) {
        return { success: false, error: 'Order not found' };
    }

    // Revert stock for each item in the order
    const updates: Array<{ id: string; stock: number }> = [];

    for (const item of orderData.items) {
        const { data: productData, error: productFetchError } = await supabase
            .from('Products')
            .select('id, stock')
            .eq('id', item.id)
            .single();

        if (productFetchError) {
            console.error('Error fetching product for stock reduction revert (SSR):', productFetchError);
            return { success: false, error: 'Failed to fetch product for stock reduction revert' };
        }

        if (!productData) {
            continue; // Product not found, skip
        }

        const newStock = productData.stock + item.quantity;
        updates.push({ id: item.id, stock: newStock });
    }

    // Perform bulk update if there are any updates
    if (updates.length > 0) {
        for (const update of updates) {
            const { error: stockUpdateError } = await supabase
                .from('Products')
                .update({ stock: update.stock })
                .eq('id', update.id);

            if (stockUpdateError) {
                console.error('Error updating product stock (SSR):', stockUpdateError);
                return { success: false, error: 'Failed to update product stock' };
            }
        }
    }

    return { success: true, error: null };
}


export async function ensureOrderInShipmentSSR(orderId: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createAdminClient();

    const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('id, planned_shipping_date_time, shipmentId')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error('Error fetching order for shipment (SSR):', fetchError);
        return { success: false, error: fetchError.message };
    }
    if (!orderData) {
        return { success: false, error: 'Order not found' };
    }

    if (orderData.shipmentId) {
        // Already in shipment
        return { success: true, error: null };
    }

    const date = orderData.planned_shipping_date_time ? orderData.planned_shipping_date_time : null;
    if (!date) {
        // No planned date, cannot assign to shipment
        return { success: false, error: 'Order has no planned shipping date' };
    }

    //get shipment by date
    let shipmentId = null;

    // Handle both Date objects and date strings
    let dateForQuery: string | null = null;

    if (date) {
        if (typeof date === 'string') {
            // If it's already a string, use it directly (assume YYYY-MM-DD format)
            dateForQuery = date;
        } else {
            // If it's a Date object, convert to ISO string
            // Convert to local date string (YYYY-MM-DD) to avoid timezone issues
            dateForQuery = date.toISOString().split('T')[0]; // 'sv-SE' gives YYYY-MM-DD
        }
    }

    const { data: existingShipment, error: shipmentFetchError } = await supabase
        .from('Shipments')
        .select('*')
        .eq('date', dateForQuery)
        .single();

    if (shipmentFetchError) { // PGRST116 = No rows found
        //create new shipment
        const { data: newShipment, error: shipmentError } = await supabase
            .from('Shipments')
            .insert([{ date: dateForQuery, productCount: 0, productAmount: 0, orderCount: 0 } as IShipment])
            .select()
            .single();

        if (shipmentError) {
            console.error('Error creating new shipment:', shipmentError);
            return { success: false, error: shipmentError.message };
        }

        shipmentId = newShipment.id;
    } else if (existingShipment) {
        shipmentId = existingShipment.id;
    }

    if (shipmentId) {
        //if it has a shipmentId already, remove it from that shipment first
        const { error: updateError } = await supabase
            .from('orders')
            .update({ shipmentId })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order with shipmentId:', updateError);
            return { success: false, error: updateError.message };
        }

        //recalculate
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .neq('order_status', 'cancelled')
            .neq('order_status', 'refunded')
            .eq('shipmentId', shipmentId);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return { success: false, error: ordersError.message };
        }

        let productCount = 0;
        let productAmount = 0;
        let orderCount = 0;

        const uniqueProductIds = new Set<string>();

        orders.forEach((order: IOrderData) => {
            // Count unique product IDs across all orders
            order.items.forEach(item => {
                uniqueProductIds.add(item.id.toString());
            });

            if (order.items.length > 0) {
                order.items.forEach(item => {
                    productAmount += item.subtotal;
                });
            };
            orderCount += 1;
        });

        productCount = uniqueProductIds.size;

        // Update the shipment with the new counts
        const { error: shipmentUpdateError } = await supabase
            .from('Shipments')
            .update({
                productCount,
                productAmount,
                orderCount
            })
            .eq('id', shipmentId);

        if (shipmentUpdateError) {
            console.error('Error updating shipment counts:', shipmentUpdateError);
        }

        return { success: true, error: null };
    }

    return { success: false, error: 'No shipment found or created for date' };
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

export async function addOrderHistoriesSSR(orderId: string, newHistories: OrderHistoryEntry[]): Promise<{ success: boolean; error: string | null }> {
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

        const history = data[0]?.history || [];
        history.push(...newHistories);

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
export async function addOrderHistorySSR(orderId: string, newHistory: OrderHistoryEntry): Promise<{ success: boolean; error: string | null }> {
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

