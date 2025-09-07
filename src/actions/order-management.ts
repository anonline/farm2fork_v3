import type { IOrderData, ICreateOrderData, OrderHistoryEntry } from 'src/types/order-management';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

/**
 * Create a new order in the database
 */
export async function createOrder(orderData: ICreateOrderData): Promise<{ orderId: string | null; error: string | null }> {
    try {
        const now = new Date().toISOString();
        
        // Generate order ID (you might want to use a different format)
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create initial history entry
        const initialHistory: OrderHistoryEntry = {
            timestamp: now,
            status: 'pending',
            note: 'Order created',
        };

        // Prepare the order object for database insertion
        const dbOrder = {
            id: orderId,
            date_created: now,
            customer_id: orderData.customerId,
            customer_name: orderData.customerName,
            billing_emails: orderData.billingEmails,
            notify_emails: orderData.notifyEmails,
            note: orderData.note,
            shipping_address: orderData.shippingAddress,
            billing_address: orderData.billingAddress,
            deny_invoice: orderData.denyInvoice,
            need_vat: orderData.needVAT,
            surcharge_amount: orderData.surchargeAmount,
            items: orderData.items,
            subtotal: orderData.subtotal,
            shipping_cost: orderData.shippingCost,
            vat_total: orderData.vatTotal,
            discount_total: orderData.discountTotal,
            total: orderData.total,
            payed_amount: 0, // Initially 0
            shipping_method: orderData.shippingMethod,
            payment_method: orderData.paymentMethod,
            payment_status: 'pending' as const,
            order_status: 'pending' as const,
            payment_due_days: orderData.paymentDueDays,
            courier: null,
            planned_shipping_date_time: orderData.plannedShippingDateTime,
            simplepay_data_json: null,
            invoice_data_json: null,
            history: [initialHistory],
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([dbOrder])
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return { orderId: null, error: error.message };
        }

        return { orderId: data.id, error: null };
    } catch (error) {
        console.error('Error creating order:', error);
        return { orderId: null, error: 'Failed to create order' };
    }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<{ order: IOrderData | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        console.log('Fetched order data:', orderId); // Debug log to check fetched data
        if (error) {
            console.error('Error fetching order:', error);
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
            plannedShippingDateTime: data.planned_shipping_date_time,
            simplepayDataJson: data.simplepay_data_json,
            invoiceDataJson: data.invoice_data_json,
            history: data.history || [],
        };

        return { order, error: null };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { order: null, error: 'Failed to fetch order' };
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string, 
    orderStatus: IOrderData['orderStatus'], 
    note?: string,
    userId?: string,
    userName?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current order to append to history
        const { order } = await getOrderById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Create new history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: new Date().toISOString(),
            status: orderStatus,
            note,
            userId,
            userName,
        };

        // Update order with new status and history
        const { error } = await supabase
            .from('orders')
            .update({
                order_status: orderStatus,
                history: [...order.history, historyEntry],
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status' };
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
    orderId: string, 
    paymentStatus: IOrderData['paymentStatus'], 
    payedAmount?: number,
    note?: string,
    userId?: string,
    userName?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current order to append to history
        const { order } = await getOrderById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Create new history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: new Date().toISOString(),
            status: paymentStatus,
            note,
            userId,
            userName,
        };

        // Prepare update data
        const updateData: any = {
            payment_status: paymentStatus,
            history: [...order.history, historyEntry],
        };

        if (payedAmount !== undefined) {
            updateData.payed_amount = payedAmount;
        }

        // Update order with new payment status and history
        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            console.error('Error updating payment status:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: 'Failed to update payment status' };
    }
}

/**
 * Get all orders with pagination and filtering
 */
export async function getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
}): Promise<{ orders: IOrderData[]; total: number; error: string | null }> {
    try {
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
        if (params?.page && params?.limit) {
            const from = (params.page - 1) * params.limit;
            const to = from + params.limit - 1;
            query = query.range(from, to);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching orders:', error);
            return { orders: [], total: 0, error: error.message };
        }

        // Transform database fields to match our interface
        const orders: IOrderData[] = (data || []).map((row) => ({
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
            plannedShippingDateTime: row.planned_shipping_date_time,
            simplepayDataJson: row.simplepay_data_json,
            invoiceDataJson: row.invoice_data_json,
            history: row.history || [],
        }));

        return { orders, total: count || 0, error: null };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], total: 0, error: 'Failed to fetch orders' };
    }
}

/**
 * Delete an order by ID
 */
export async function deleteOrder(orderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting order:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: 'Failed to delete order' };
    }
}

/**
 * Delete multiple orders by IDs
 */
export async function deleteOrders(orderIds: string[]): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .in('id', orderIds);

        if (error) {
            console.error('Error deleting orders:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting orders:', error);
        return { success: false, error: 'Failed to delete orders' };
    }
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
    orderId: string, 
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
    payedAmount?: number
): Promise<{ success: boolean; error: string | null }> {
    try {
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
            console.error('Error updating order payment status:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order payment status:', error);
        return { success: false, error: 'Failed to update order payment status' };
    }
}

/**
 * Get the count of pending orders
 */
export async function getPendingOrdersCount(): Promise<{ count: number; error: string | null }> {
    try {
        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('order_status', 'pending');

        if (error) {
            console.error('Error fetching pending orders count:', error);
            return { count: 0, error: error.message };
        }

        return { count: count || 0, error: null };
    } catch (error) {
        console.error('Error fetching pending orders count:', error);
        return { count: 0, error: 'Failed to fetch pending orders count' };
    }
}
