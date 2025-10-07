import type {
    IOrderData,
    PaymentStatus,
    ICreateOrderData,
    OrderHistoryEntry,
} from 'src/types/order-management';

import { fDate } from 'src/utils/format-time';
import { finishTransaction } from 'src/utils/simplepay';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

/**
 * Create a new order in the database
 */
export async function createOrder(
    orderData: ICreateOrderData
): Promise<{ orderId: string | null; error: string | null }> {
    try {
        const now = new Date().toISOString();

        // Generate order ID (you might want to use a different format)
        const randomOrderId = Math.random().toString(36).substr(2, 9);
        
        let latestOrderId = await getLatestOrderId();
        if (latestOrderId) {
            orderData.id = (Number(latestOrderId) + 1).toString();
        }

        // Create initial history entry
        const initialHistory: OrderHistoryEntry = {
            timestamp: now,
            status: 'pending',
            note: 'Rendelés létrehozva',
        };

        // Prepare the order object for database insertion
        const dbOrder = {
            id: orderData.id ?? randomOrderId, // Use provided ID
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

        const { data, error } = await supabase.from('orders').insert([dbOrder]).select().single();

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

export async function insertOrder(
    orderData: IOrderData
): Promise<{ orderId: string | null; error: string | null }> {
    await supabase.from('Shipments')
    .upsert({
        id: orderData.shipmentId,
        date: fDate(orderData.plannedShippingDateTime)
    })
    .eq('id', orderData.shipmentId);

    const dbOrder = {
            id: orderData.id , // Use provided ID
            date_created: orderData.dateCreated,
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
            payed_amount: orderData.payedAmount,
            shipping_method: orderData.shippingMethod,
            payment_method: orderData.paymentMethod,
            payment_status: orderData.paymentStatus,
            order_status: orderData.orderStatus,
            payment_due_days: orderData.paymentDueDays,
            courier: orderData.courier,
            planned_shipping_date_time: orderData.plannedShippingDateTime,
            simplepay_data_json: orderData.simplepayDataJson,
            invoice_data_json: orderData.invoiceDataJson || null,
            history: [],
            history_for_user: orderData.history_for_user || '',
            shipmentId: orderData.shipmentId || null,
            shipment_time: orderData.shipment_time || '',
            wooUserId: orderData.wooUserId || null,
        };

    return await supabase
        .from('orders')
        .insert([dbOrder])
        .select('id')
        .single()
        .then(({ data, error }) => {
            if (error) {
                console.error('Error inserting order:', error);
                return { orderId: null, error: error.message };
            }
            return { orderId: data.id, error: null };
        });
}

/**
 * Get order by ID
 */
export async function getOrderById(
    orderId: string
): Promise<{ order: IOrderData | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

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
            plannedShippingDateTime: data.planned_shipping_date_time
                ? new Date(data.planned_shipping_date_time)
                : null,
            shipment_time: data.shipment_time || '',
            simplepayDataJson: data.simplepay_data_json,
            invoiceDataJson: data.invoice_data_json,
            history: data.history || [],
            history_for_user: data.history_for_user || '',
            shipmentId: data.shipmentId || null,
        };

        // Fetch bundle items for products that are bundles
        // Since items stored in the database don't have type info, we need to fetch it from Products table
        const itemIds = order.items.map(item => item.id).filter(Boolean);
        
        if (itemIds.length > 0) {
            // Fetch product types from Products table
            const { data: productsData, error: productsError } = await supabase
                .from('Products')
                .select('id, type')
                .in('id', itemIds);
            
            if (!productsError && productsData) {
                // Create a map of product IDs to their types
                const productTypesMap = new Map(
                    productsData.map(p => [p.id.toString(), p.type])
                );
                
                // Enrich order items with product types
                order.items = order.items.map(item => ({
                    ...item,
                    type: productTypesMap.get(item.id) || 'simple',
                }));
            }
        }
        
        const bundleProductIds = order.items
            .filter(item => item.type === 'bundle' && item.id)
            .map(item => item.id);

        if (bundleProductIds.length > 0) {
            const { data: bundleData, error: bundleError } = await supabase
                .from('ProductsInBoxes')
                .select('boxId, productId, qty, product:Products!ProductsInBoxes_productId_fkey(*)')
                .in('boxId', bundleProductIds);

            if (bundleError) {
                console.error('Error fetching bundle items:', bundleError);
            } else if (bundleData) {
                const bundleItemsMap = new Map<string, any[]>();

                bundleData.forEach((item: any) => {
                    const boxId = item.boxId.toString();

                    if (!bundleItemsMap.has(boxId)) {
                        bundleItemsMap.set(boxId, []);
                    }

                    bundleItemsMap.get(boxId)!.push({
                        productId: item.productId.toString(),
                        qty: item.qty,
                        product: {
                            id: item.product.id.toString(),
                            name: item.product.name,
                            sku: item.product.sku,
                            unit: item.product.unit,
                            coverUrl: item.product.coverUrl || item.product.featuredImage,
                            netPrice: item.product.netPrice,
                            grossPrice: item.product.grossPrice,
                            bio: item.product.bio,
                        },
                    });
                });

                // Enrich order items with bundle data
                order.items = order.items.map(item => {
                    if (item.type === 'bundle' && bundleItemsMap.has(item.id)) {
                        return {
                            ...item,
                            bundleItems: bundleItemsMap.get(item.id),
                        };
                    }
                    return item;
                });
            }
        }

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
        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

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
 * Helper function to transform database row to IOrderData
 */
function transformOrderRow(row: any): IOrderData {
    return {
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
        plannedShippingDateTime: row.planned_shipping_date_time
            ? new Date(row.planned_shipping_date_time)
            : null,
        shipment_time: row.shipment_time || '',
        simplepayDataJson: row.simplepay_data_json,
        invoiceDataJson: row.invoice_data_json,
        history: row.history || [],
        shipmentId: row.shipmentId || null,
    };
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
        const orders: IOrderData[] = (data || []).map(transformOrderRow);

        return { orders, total: count || 0, error: null };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], total: 0, error: 'Failed to fetch orders' };
    }
}

/**
 * Get all orders in batches (for large datasets)
 * This method fetches all orders matching the filter criteria in batches
 */
export async function getAllOrdersBatched(params?: {
    status?: string;
    customerId?: string;
    batchSize?: number;
    onBatchFetched?: (batch: IOrderData[], batchNumber: number, total: number) => void;
}): Promise<{ orders: IOrderData[]; total: number; error: string | null }> {
    try {
        const batchSize = params?.batchSize || 1000;
        const allOrders: IOrderData[] = [];
        let currentBatch = 0;
        let totalCount = 0;
        let hasMore = true;
        const hardPagelimit = 5;

        while (hasMore) {
            console.log(currentBatch);
            // Build query with filters
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

            // Apply batch range
            const from = currentBatch * batchSize;
            const to = from + batchSize - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) {
                console.error(`Error fetching orders batch ${currentBatch + 1}:`, error);
                return { orders: allOrders, total: totalCount, error: error.message };
            }

            // Store total count from first batch
            if (currentBatch === 0) {
                totalCount = count || 0;
            }

            // Transform and add to results
            const batchOrders = (data || []).map(transformOrderRow);
            allOrders.push(...batchOrders);

            // Call progress callback if provided
            if (params?.onBatchFetched) {
                params.onBatchFetched(batchOrders, currentBatch + 1, totalCount);
            }

            // Check if there are more batches to fetch
            hasMore = data && data.length === batchSize;
            currentBatch++;
            if(currentBatch > hardPagelimit) break;
        }

        return { orders: allOrders, total: totalCount, error: null };
    } catch (error) {
        console.error('Error fetching orders in batches:', error);
        return { orders: [], total: 0, error: 'Failed to fetch orders in batches' };
    }
}

/**
 * Delete an order by ID
 */
export async function deleteOrder(
    orderId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);

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
export async function deleteOrders(
    orderIds: string[]
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);

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
    paymentStatus: PaymentStatus,
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

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

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
 * Update order delivery guy (courier field)
 */
export async function updateOrderDeliveryGuy(
    orderId: string,
    deliveryGuyId: number | null
): Promise<{ success: boolean; error: string | null }> {
    try {
        const updateData: any = {
            courier: deliveryGuyId ? deliveryGuyId.toString() : null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

        if (error) {
            console.error('Error updating order delivery guy:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order delivery guy:', error);
        return { success: false, error: 'Failed to update order delivery guy' };
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

/**
 * Update order items and recalculate totals
 */
export async function updateOrderItems(
    orderId: string,
    items: Array<{
        id: string;
        name: string;
        size?: string;
        netPrice: number;
        grossPrice: number;
        unit?: string;
        coverUrl: string;
        quantity: number;
        subtotal: number;
        note?: string;
        custom?: boolean;
        slug?: string;
    }>,
    note?: string,
    userId?: string,
    userName?: string,
    surchargeAmount?: number,
    userType: 'public' | 'vip' | 'company' = 'public',
    shippingCost?: number,
    discountTotal?: number,
    historyForUser?: string[]
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current order to append to history
        const { order } = await getOrderById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        // Calculate new totals
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const newSurchargeAmount = surchargeAmount ?? order.surchargeAmount;
        const newShippingCost = shippingCost ?? order.shippingCost;
        const newDiscountTotal = discountTotal ?? order.discountTotal;
        const total =
            subtotal +
            newShippingCost +
            (userType == 'company' ? order.vatTotal : 0) +
            newSurchargeAmount -
            newDiscountTotal;

        // Create new history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: new Date().toISOString(),
            status: order.orderStatus, // Keep the same status
            note: note || 'Rendelés tételek frissítve',
            userId,
            userName,
        };

        // Get current history_for_user or initialize as empty string
        const currentHistoryForUser = order.history_for_user || '';
        
        // Add new history entries to history_for_user if provided
        let updatedHistoryForUser = currentHistoryForUser;
        if (historyForUser && historyForUser.length > 0) {
            const newEntries = historyForUser.join('\n');
            updatedHistoryForUser = currentHistoryForUser 
                ? `${currentHistoryForUser}\n${newEntries}` 
                : newEntries;
        }

        // Update order with new items, totals, and history
        const updateData: any = {
            items,
            subtotal,
            total,
            history: [...order.history, historyEntry],
            updated_at: new Date().toISOString(),
        };

        // Only update history_for_user if there are new entries
        if (historyForUser && historyForUser.length > 0) {
            updateData.history_for_user = updatedHistoryForUser;
        }

        // Only update surcharge_amount if a new value was provided
        if (surchargeAmount !== undefined) {
            updateData.surcharge_amount = newSurchargeAmount;
        }

        // Only update shipping_cost if a new value was provided
        if (shippingCost !== undefined) {
            updateData.shipping_cost = newShippingCost;
        }

        // Only update discount_total if a new value was provided
        if (discountTotal !== undefined) {
            updateData.discount_total = newDiscountTotal;
        }

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

        if (error) {
            console.error('Error updating order items:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order items:', error);
        return { success: false, error: 'Failed to update order items' };
    }
}

/**
 * Update order history_for_user field
 */
export async function updateOrderUserHistory(
    orderId: string,
    historyForUser: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                history_for_user: historyForUser,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order user history:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order user history:', error);
        return { success: false, error: 'Failed to update order user history' };
    }
}

/**
 * Get all orders by shipment ID
 */
export async function getOrdersByShipmentId(
    shipmentId: number
): Promise<{ orders: IOrderData[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('shipmentId', shipmentId)
            .order('date_created', { ascending: false });

        if (error) {
            console.error('Error fetching orders by shipment ID:', error);
            return { orders: [], error: error.message };
        }

        // Transform database fields to match our interface
        const orders: IOrderData[] = (data || [])
            .filter((order) => ['cancelled', 'refunded'].includes(order.order_status) == false)
            .map((row: any) => ({
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
                plannedShippingDateTime: row.planned_shipping_date_time
                    ? new Date(row.planned_shipping_date_time)
                    : null,
                shipment_time: row.shipment_time || '',
                simplepayDataJson: row.simplepay_data_json,
                invoiceDataJson: row.invoice_data_json,
                history: row.history || [],
                shipmentId: row.shipmentId || null,
            }));

        return { orders, error: null };
    } catch (error) {
        console.error('Error fetching orders by shipment ID:', error);
        return { orders: [], error: 'Failed to fetch orders by shipment ID' };
    }
}

/**
 * Update order invoice and payment settings
 */
export async function updateOrderInvoiceSettings(
    orderId: string,
    denyInvoice: boolean,
    paymentDueDays?: number,
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
            status: order.orderStatus,
            note:
                note ||
                (() => {
                    const statusText = denyInvoice ? 'Számla tiltva' : 'Számla engedélyezve';
                    const paymentText =
                        paymentDueDays !== undefined
                            ? `, Fizetési határidő: ${paymentDueDays} nap`
                            : '';
                    return `Számla beállítások frissítve: ${statusText}${paymentText}`;
                })(),
            userId,
            userName,
        };

        // Prepare update data
        const updateData: any = {
            deny_invoice: denyInvoice,
            history: [...order.history, historyEntry],
        };

        // Only update payment due days if provided
        if (paymentDueDays !== undefined) {
            updateData.payment_due_days = paymentDueDays;
        }

        // Update order
        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

        if (error) {
            console.error('Error updating order invoice settings:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order invoice settings:', error);
        return { success: false, error: 'Failed to update order invoice settings' };
    }
}

/**
 * Update order invoice data JSON (Billingo response)
 */
export async function updateOrderInvoiceData(
    orderId: string,
    invoiceDataJson: any,
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
            status: order.orderStatus,
            note: note || `Billingo számla adatok frissítve`,
            userId,
            userName,
        };

        // Prepare update data
        const updateData: any = {
            invoice_data_json: invoiceDataJson,
            history: [...order.history, historyEntry],
            updated_at: new Date().toISOString(),
        };

        // Update order
        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

        if (error) {
            console.error('Error updating order invoice data:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order invoice data:', error);
        return { success: false, error: 'Failed to update order invoice data' };
    }
}

/**
 * Update order shipping address
 */
export async function updateOrderShippingAddress(
    orderId: string,
    shippingAddress: any,
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
            status: order.orderStatus, // Keep the same status
            note: note || 'Szállítási cím frissítve',
            userId,
            userName,
        };

        // Update order with new shipping address and history
        const { error } = await supabase
            .from('orders')
            .update({
                shipping_address: shippingAddress,
                history: [...order.history, historyEntry],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order shipping address:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order shipping address:', error);
        return { success: false, error: 'Failed to update order shipping address' };
    }
}

/**
 * Update order billing address
 */
export async function updateOrderBillingAddress(
    orderId: string,
    billingAddress: any,
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

        // Check if invoice has been created - if so, prevent updating billing address
        if (order.invoiceDataJson) {
            return {
                success: false,
                error: 'A számlázási cím nem módosítható, mert már létrejött a számla.',
            };
        }

        // Create new history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: new Date().toISOString(),
            status: order.orderStatus, // Keep the same status
            note: note || 'Számlázási cím frissítve',
            userId,
            userName,
        };

        // Update order with new billing address and history
        const { error } = await supabase
            .from('orders')
            .update({
                billing_address: billingAddress,
                history: [...order.history, historyEntry],
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order billing address:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order billing address:', error);
        return { success: false, error: 'Failed to update order billing address' };
    }
}

export async function finishSimplePayTransaction(
    orderId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { order, error: fetchError } = await getOrderById(orderId);
        if (fetchError) {
            return { success: false, error: fetchError };
        }
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        if (order.paymentStatus !== 'paid') {
            return { success: false, error: 'Finishing transaction cannot perform.' };
        }

        if (order.paymentMethod?.slug !== 'simple') {
            const simplePayFinishResult = await finishTransaction({
                orderRef: order.id,
                originalTotal: Math.round(order.payedAmount), // originalTotal
                approveTotal: 0, // approveTotal (charge 1500, release 1000)
            });

            console.log('Full cancellation successful:', simplePayFinishResult);
            await updateOrderPaymentStatus(order.id, 'refunded', 0);

            return { success: true, error: null };
        } else {
            const simplePayFinishResult = await finishTransaction({
                orderRef: order.id,
                originalTotal: Math.round(order.payedAmount), // originalTotal
                approveTotal: Math.round(order.total), // approveTotal (charge 1500, release 1000)
            });

            console.log('Partial charge successful:', simplePayFinishResult);

            await updateOrderPaymentStatus(order.id, 'closed', Math.round(order.total));

            return { success: true, error: null };
        }
    } catch (error) {
        console.error('Error finishing SimplePay transaction:', error);
        return { success: false, error: 'Failed to finish SimplePay transaction' };
    }
}

export async function cancelSimplePayTransaction(
    orderId: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { order, error: fetchError } = await getOrderById(orderId);
        if (fetchError) {
            return { success: false, error: fetchError };
        }
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        if (order.paymentStatus !== 'paid') {
            return {
                success: false,
                error: 'Cannot cancel transaction - payment status is not paid',
            };
        }

        const simplePayCancelResult = await finishTransaction({
            orderRef: order.id,
            originalTotal: Math.round(order.payedAmount), // originalTotal - must match reserved amount
            approveTotal: 0, // approveTotal = 0 means full cancellation/refund
        });

        console.log('SimplePay transaction cancelled successfully:', simplePayCancelResult);

        // Update payment status to refunded
        await updateOrderPaymentStatus(order.id, 'refunded', 0);

        return { success: true, error: null };
    } catch (error) {
        console.error('Error cancelling SimplePay transaction:', error);
        return { success: false, error: 'Failed to cancel SimplePay transaction' };
    }
}

/**
 * Clear invoice data from order (after storno)
 */
export async function clearOrderInvoiceData(
    orderId: string,
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
            status: order.orderStatus,
            note: note || 'Számla adatok törölve sztornó után',
            userId,
            userName,
        };

        // Prepare update data - clear invoice data
        const updateData: any = {
            invoice_data_json: null,
            history: [...order.history, historyEntry],
            updated_at: new Date().toISOString(),
        };

        // Update order
        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);

        if (error) {
            console.error('Error clearing order invoice data:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error clearing order invoice data:', error);
        return { success: false, error: 'Failed to clear order invoice data' };
    }
}

/**
 * Update order payment method
 */
export async function updateOrderPaymentMethod(
    orderId: string,
    paymentMethodId: number,
    userId?: string,
    userName?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // First, get the payment method details
        const { data: paymentMethod, error: pmError } = await supabase
            .from('PaymentMethods')
            .select('*')
            .eq('id', paymentMethodId)
            .single();

        if (pmError) {
            return { success: false, error: `Payment method not found: ${pmError.message}` };
        }

        // Get current order to append to history
        const { order } = await getOrderById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        const now = new Date().toISOString();

        // Create history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: now,
            status: order.orderStatus,
            note: `Fizetési mód módosítva: ${paymentMethod.name}`,
            userId,
            userName,
        };

        // Add to existing history
        const updatedHistory = [...(order.history || []), historyEntry];

        // Update the order
        const { error } = await supabase
            .from('orders')
            .update({
                payment_method: paymentMethod,
                history: updatedHistory,
                updated_at: now,
            })
            .eq('id', orderId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order payment method:', error);
        return { success: false, error: 'Failed to update payment method' };
    }
}

/**
 * Update order note
 */
export async function updateOrderNote(
    orderId: string,
    note: string,
    userId?: string,
    userName?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get current order to append to history
        const { order } = await getOrderById(orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        const now = new Date().toISOString();

        // Create new history entry
        const historyEntry: OrderHistoryEntry = {
            timestamp: now,
            status: order.orderStatus,
            note: 'Megjegyzés frissítve',
            userId,
            userName,
        };

        // Add to existing history
        const updatedHistory = [...(order.history || []), historyEntry];

        // Update the order
        const { error } = await supabase
            .from('orders')
            .update({
                note,
                history: updatedHistory,
                updated_at: now,
            })
            .eq('id', orderId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order note:', error);
        return { success: false, error: 'Failed to update order note' };
    }
}

/**
 * Update order customer and recalculate totals
 */
export async function updateOrderCustomer(
    orderId: string,
    customerId: string,
    customerName: string,
    historyNote?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get the current order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return { success: false, error: fetchError?.message || 'Order not found' };
        }

        // Calculate new shipping cost based on new customer type
        // First, get customer data to determine user type
        const { data: customerData, error: customerError } = await supabase
            .from('CustomerDatas')
            .select('isCompany, discountPercent')
            .or(`uid.eq.${customerId}`)
            .single();

        if (customerError) {
            console.warn('Could not fetch customer data for shipping calculation:', customerError);
        }

        const userType: 'public' | 'vip' | 'company' = customerData?.isCompany
            ? 'company'
            : customerData?.discountPercent > 0
              ? 'vip'
              : 'public';

        // Get shipping method to recalculate cost
        let newShippingCost = order.shipping_cost; // Default to current cost

        if (order.shipping_method && typeof order.shipping_method === 'object') {
            const shippingMethod = order.shipping_method as any;
            if (shippingMethod.id) {
                // Fetch the shipping cost method to recalculate
                const { data: shippingCostMethod, error: shippingError } = await supabase
                    .from('ShippingCostsMethods')
                    .select('*')
                    .eq('id', shippingMethod.id)
                    .single();

                if (!shippingError && shippingCostMethod) {
                    // Recalculate shipping cost for new customer type
                    let netCost = 0;
                    let applyVAT = false;

                    switch (userType) {
                        case 'vip':
                            netCost = shippingCostMethod.netCostVIP || 0;
                            applyVAT = shippingCostMethod.vatVIP || false;
                            break;
                        case 'company':
                            netCost = shippingCostMethod.netCostCompany || 0;
                            applyVAT = shippingCostMethod.vatCompany || false;
                            break;
                        default:
                            netCost = shippingCostMethod.netCostPublic || 0;
                            applyVAT = shippingCostMethod.vatPublic || false;
                            break;
                    }

                    // Apply VAT if required
                    if (applyVAT && netCost > 0) {
                        const vatAmount = (netCost * shippingCostMethod.vat) / 100;
                        newShippingCost = netCost + vatAmount;
                    } else {
                        newShippingCost = netCost;
                    }
                }
            }
        }

        // Calculate new totals
        const subtotal = order.subtotal || 0;
        const vatTotal = order.vat_total || 0;
        const discountTotal = order.discount_total || 0;
        const surchargeAmount = order.surcharge_amount || 0;

        const newTotal = subtotal + newShippingCost + vatTotal + surchargeAmount - discountTotal;

        // Prepare history entry
        const now = new Date().toISOString();
        const currentHistory = Array.isArray(order.history) ? order.history : [];
        const newHistory = [
            ...currentHistory,
            {
                timestamp: now,
                status: order.order_status,
                note:
                    historyNote ||
                    `Vásárló módosítva: ${customerName} (${customerId}), szállítási költség újraszámítva: ${newShippingCost} Ft`,
            },
        ];

        // Update the order
        const { error: updateError } = await supabase
            .from('Orders')
            .update({
                customer_id: customerId,
                customer_name: customerName,
                shipping_cost: newShippingCost,
                total: newTotal,
                history: newHistory,
                updated_at: now,
            })
            .eq('id', orderId);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating order customer:', error);
        return { success: false, error: 'Failed to update order customer' };
    }
}

export async function getLatestOrderId(): Promise<string> {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id')
            .order('date_created', { ascending: false })
            .limit(1)
            .single();

        if (fetchError) {
            console.error('Error fetching latest order ID:', fetchError);
            return '';
        }

        return order.id.toString();

    } catch (error) {
        console.error('Error fetching latest order ID:', error);
        return '';
    }
}