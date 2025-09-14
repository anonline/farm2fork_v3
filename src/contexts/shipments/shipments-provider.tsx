'use client';
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "src/lib/supabase";
import { ShipmentsContext } from "./shipments-context";
import { IOrderData } from "src/types/order-management";
import { IShipment } from "src/types/shipments";

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

    const refreshCounts = useCallback(async (shipmentId: string) => {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('shipmentId', shipmentId);

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
                return;
            }

        let productCount = 0;
        let productAmount = 0;
        let orderCount = 0;

        orders.forEach((order: IOrderData) => {
            productCount += order.items.length;
            if(order.items.length > 0) {
                order.items.forEach(item => {
                    productAmount += item.subtotal;
                });
            };
            orderCount += 1;
        });

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

    const setOrderToShipment = useCallback(async (orderId: string, shipmentId: string) => {
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

        //if it has a shipmentId already, remove it from that shipment first
        if (order.shipmentId) {
            removeOrderFromShipment(orderId);
        }

        //update order with shipmentId
        const { error: updateError } = await supabase
            .from('orders')
            .update({ shipmentId })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order with shipmentId:', updateError);
            return;
        }

        refreshCounts(shipmentId);
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

        let shipmentId = order.shipmentId;

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
        removeOrderFromShipment
    }), [
        shipments,
        shipmentsLoading,
        shipmentsError,
        fetchShipments,
        addShipment,
        refreshCounts,
        setOrderToShipment,
        removeOrderFromShipment
    ]);

    return <ShipmentsContext.Provider value={memoizedValue}>{children}</ShipmentsContext.Provider>;
}