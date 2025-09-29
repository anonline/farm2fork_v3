'use client';

import type { ReactNode} from "react";
import type { IShipment } from "src/types/shipments";
import type { IOrderData } from "src/types/order-management";

import { useMemo, useState, useEffect, useCallback } from "react";

import { supabase } from "src/lib/supabase";

import { ShipmentsContext } from "./shipments-context";

export function ShipmentsProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [shipmentsLoading, setShipmentsLoading] = useState(true);
    const [shipmentsError, setShipmentsError] = useState<string | null>(null);

    const fetchShipments = useCallback(async () => {
        setShipmentsLoading(true);
        setShipmentsError(null);

        try {
            const { data, error } = await supabase
                .from('Shipments')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            setShipments(data || []);
        } catch (error: any) {
            setShipmentsError(error.message);
        } finally {
            setShipmentsLoading(false);
        }
    }, []);

    const addShipment = useCallback(async (newShipment: Omit<IShipment, 'date' | 'updatedAt'>) => {
        const { data, error } = await supabase
            .from('Shipments')
            .insert([newShipment])
            .select()
            .single();

        if (error) throw error;

        setShipments((prev) => [...prev, data]);
    }, []);

    const refreshCounts = useCallback(async (shipmentId: number) => {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .neq('order_status', 'cancelled')
            .neq('order_status', 'refunded')
            .eq('shipmentId', shipmentId);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return;
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
        const { error: updateError } = await supabase
            .from('Shipments')
            .update({
                productCount,
                productAmount,
                orderCount
            })
            .eq('id', shipmentId);

        if (updateError) {
            console.error('Error updating shipment counts:', updateError);
        }

        fetchShipments();
    }, []);

    const setOrderToShipment = useCallback(async (orderId: string, newShipmentId: number) => {
        //get order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('shipmentId')
            .eq('id', orderId)
            .single();

        if (orderError) {
            console.error('Error fetching order:', orderError);
            return;
        }

        //if it already in this shipment, do nothing
        if (order.shipmentId === newShipmentId) {
            return;
        }

        //if it has a shipmentId already, remove it from that shipment first
        if (order.shipmentId !== null) {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ shipmentId: null })
                .eq('id', orderId);

            if (updateError) {
                console.error('Error updating order with null shipmentId:', updateError);
                return;
            }

            refreshCounts(order.shipmentId);
        }

        const {data:shipmentData, error:shipmentError} = await supabase
            .from('Shipments')
            .select('*')
            .eq('id', newShipmentId)
            .single();

        if (shipmentError) {
            console.error('Error fetching shipment:', shipmentError);
            return;
        }

        //update order with shipmentId
        const { error: updateError } = await supabase
            .from('orders')
            .update({ shipmentId: newShipmentId, planned_shipping_date_time: shipmentData.date })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order with shipmentId:', updateError);
            return;
        }

        refreshCounts(newShipmentId);
    }, []);


    /**
     * Removes an order from its associated shipment by setting the order's shipmentId to null.
     * 
     * This function performs the following operations:
     * 1. Fetches the order by ID to retrieve its current shipmentId
     * 2. Validates that the order has an associated shipmentId
     * 3. Updates the order record to remove the shipment association
     * 4. Refreshes the shipment counts to reflect the change
     * 
     * @param orderId - The unique identifier of the order to remove from shipment
     * @returns Promise<void> - Resolves when the operation completes or fails
     * 
     * @remarks
     * - If the order is not found, an error is logged and the function returns early
     * - If the order doesn't have a shipmentId, a warning is logged and the function returns early
     * - If the database update fails, an error is logged and the function returns early
     * - On successful removal, the shipment counts are automatically refreshed
     */
    const removeOrderFromShipment = useCallback(async (orderId: string) => {
        //get order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (orderError) {
            console.error('Error fetching order:', orderError);
            return;
        }

        if (!order.shipmentId) {
            console.warn('Order does not have a shipmentId:', orderId);
            return;
        }

        const shipmentId = order.shipmentId;

        //update order with null shipmentId
        const { error: updateError } = await supabase
            .from('orders')
            .update({ shipmentId: null })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order with null shipmentId:', updateError);
            return;
        }

        refreshCounts(shipmentId);
    }, []);

    const setOrderToShipmentByDate = useCallback(async (orderId: string, date: Date | string | null) => {
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
                dateForQuery = date.toDateString(); // 'sv-SE' gives YYYY-MM-DD
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
                return;
            }

            shipmentId = newShipment.id;
        } else if (existingShipment) {
            shipmentId = existingShipment.id;
        }

        if (shipmentId) {
            setOrderToShipment(orderId, shipmentId);
            return;
        }

        console.error('No shipment found or created for date:', date);
    }, []);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    const memoizedValue = useMemo(() => ({
        shipments,
        shipmentsLoading,
        shipmentsError,
        shipmentsMutate: fetchShipments,
        addShipment,
        refreshCounts,
        setOrderToShipment,
        removeOrderFromShipment,
        setOrderToShipmentByDate
    }), [
        shipments,
        shipmentsLoading,
        shipmentsError,
        fetchShipments,
        addShipment,
        refreshCounts,
        setOrderToShipment,
        removeOrderFromShipment,
        setOrderToShipmentByDate
    ]);

    return <ShipmentsContext.Provider value={memoizedValue}>{children}</ShipmentsContext.Provider>;
}