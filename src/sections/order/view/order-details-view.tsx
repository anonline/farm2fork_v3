'use client';

import type { IOrderProductItem } from 'src/types/order';
import type { OrderStatus, PaymentStatus } from 'src/types/order-management';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { useGetDeliveries } from 'src/actions/delivery';
import { DashboardContent } from 'src/layouts/dashboard';
import { useOrderContext } from 'src/contexts/order-context';
import { triggerOrderProcessedEmail } from 'src/actions/email-ssr';
import { createBillingoInvoiceSSR } from 'src/actions/billingo-ssr';
import { useShipments } from 'src/contexts/shipments/shipments-context';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from 'src/_mock';
import { updateOrderItems, updateOrderStatus, updateOrderInvoiceData, updateOrderUserHistory, updateOrderDeliveryGuy, updateOrderPaymentMethod, updateOrderPaymentStatus, finishSimplePayTransaction, cancelSimplePayTransaction } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';

import { OrderDetailsItems } from '../order-details-items';
import { OrderDetailsToolbar } from '../order-details-toolbar';
import { OrderDetailsHistory } from '../order-details-history';
import { OrderDetailsPayment } from '../order-details-payment';
import { OrderDetailsBilling } from '../order-details-billing';
import { OrderDetailsCustomer } from '../order-details-customer';
import { OrderDetailsDelivery } from '../order-details-delivery';
import { OrderDetailsShipping } from '../order-details-shipping';
import { OrderDetailsAdminNotes } from '../order-details-admin-notes';
import { OrderDetailsUserHistory } from '../order-details-user-history';

import type { ProductForOrder } from '../product-selection-modal';

// ----------------------------------------------------------------------

type Props = {
    readonly orderId: string;
};

export function OrderDetailsView({ orderId }: Props) {
    const { state, updateOrder, updateOrderData, refreshOrderHistory, fetchOrder } = useOrderContext();
    const { refreshCounts } = useShipments();
    const { order, orderData, loading, error } = state;
    const { deliveries } = useGetDeliveries();

    const [status, setStatus] = useState(order?.status);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<IOrderProductItem[]>(order?.items || []);
    const [originalItems, setOriginalItems] = useState<IOrderProductItem[]>(order?.items || []);
    const [editedSurcharge, setEditedSurcharge] = useState(orderData?.surchargeAmount || 0);
    const [editedShipping, setEditedShipping] = useState(orderData?.shippingCost || 0);
    const [editedDiscount, setEditedDiscount] = useState(orderData?.discountTotal || 0);
    const [historyForUser, setHistoryForUser] = useState(orderData?.history_for_user || '');
    const [showPaymentAlert, setShowPaymentAlert] = useState(false);
    const [showCancellationAlert, setShowCancellationAlert] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);

    // Fetch order data when component mounts or orderId changes
    useEffect(() => {
        if (orderId) {
            fetchOrder(orderId);
        }
    }, [orderId, fetchOrder]);

    // Update local state when order data changes from context
    useEffect(() => {
        if (order) {
            setStatus(order.status);
            setEditedItems([...order.items || []]);
        }
    }, [order]);

    useEffect(() => {
        if (orderData) {
            setEditedSurcharge(orderData.surchargeAmount || 0);
            setEditedShipping(orderData.shippingCost || 0);
            setEditedDiscount(orderData.discountTotal || 0);
            setHistoryForUser(orderData.history_for_user || '');
        }
    }, [orderData]);

    // Handler for payment method changes
    const handlePaymentMethodChange = useCallback(async (paymentMethodId: number) => {
        if (!orderId || !orderData) return;

        try {
            const result = await updateOrderPaymentMethod(
                orderId,
                paymentMethodId,
                'admin', // You might want to get actual user info
                'Admin User' // You might want to get actual user name
            );

            if (result.success) {
                toast.success('Fizetési mód sikeresen módosítva');
                // Refresh order data
                await fetchOrder(orderId);
            } else {
                toast.error(`Hiba a fizetési mód módosításakor: ${result.error}`);
            }
        } catch (updateError) {
            console.error('Error updating payment method:', updateError);
            toast.error('Hiba történt a fizetési mód módosításakor');
        }
    }, [orderId, orderData, fetchOrder]);

    const sendNotificationEmail = useCallback(async (notifyEmails: string[]) => {
        if (!orderData) return;

        try {
            await Promise.all(notifyEmails.map(async email => {
                if (email?.includes('@')) {
                    await triggerOrderProcessedEmail(email, orderData.customerName, orderData.id, fDate(orderData.plannedShippingDateTime));
                }
            }));
        } catch (emailError) {
            console.error('Error sending notification emails:', emailError);
            toast.error('Hiba történt az értesítő e-mailek küldése során');
        }
        toast.success('Értesítő e-mailek sikeresen elküldve!');

    }, [orderData]);

    const handleChangeStatus = useCallback(async (newStatus: string) => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }
        const oldStatus = status;

        // Handle cancellation with payment refund logic
        if (newStatus === 'cancelled') {
            const isSimplePayment = orderData?.paymentMethod?.slug === 'simple';
            const isPaid = orderData?.paymentStatus === 'paid';

            if (isSimplePayment && isPaid) {
                // For SimplePay payments that are paid, we can automatically refund
                try {
                    setStatus(newStatus); // Update UI immediately

                    const cancelResult = await cancelSimplePayTransaction(orderData.id);

                    if (cancelResult.success) {
                        // Update the status
                        const { success, error: statusUpdateError } = await updateOrderStatus(
                            orderData.id,
                            newStatus as OrderStatus,
                            `Rendelés törölve, SimplePay visszatérítés kezdeményezve`
                        );

                        if (success) {
                            // Update order context
                            if (order) {
                                updateOrder({
                                    ...order,
                                    status: newStatus,
                                });
                            }

                            if (orderData) {
                                updateOrderData({
                                    ...orderData,
                                    orderStatus: newStatus as OrderStatus,
                                    paymentStatus: 'refunded',
                                });
                            }

                            // Refresh order history to show the new entry
                            await refreshOrderHistory();

                            toast.success('Rendelés sikeresen törölve és SimplePay visszatérítés kezdeményezve!');

                        } else {
                            setStatus(oldStatus); // Revert status change
                            toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
                            return;
                        }
                    } else {
                        setStatus(oldStatus); // Revert status change
                        toast.error(cancelResult.error || 'Hiba történt a SimplePay visszatérítés során');
                        return;
                    }
                } catch (cancelError) {
                    console.error('Error cancelling SimplePay transaction:', cancelError);
                    setStatus(oldStatus); // Revert status change
                    toast.error('Hiba történt a SimplePay visszatérítés során');
                    return;
                }
            } else {
                // For other payment methods that are paid, show manual alert
                setShowCancellationAlert(true);
                setStatus(oldStatus); // Revert status change until user confirms
                return;
            }
            // For unpaid orders, continue with normal cancellation flow below
        }

        setStatus(newStatus);

        const shouldRemoveSurcharge = oldStatus === 'pending' && newStatus !== 'pending';

        if (newStatus == 'pending') {
            try {
                // Update the status in the database
                const { success, error: statusUpdateError } = await updateOrderStatus(
                    orderData.id,
                    newStatus as OrderStatus,
                    `Státusz változtatás: ${oldStatus} -> ${newStatus}`
                );

                if (success) {
                    // Update order context
                    if (order) {
                        updateOrder({
                            ...order,
                            status: newStatus,
                        });
                    }

                    if (orderData) {
                        updateOrderData({
                            ...orderData,
                            orderStatus: newStatus as OrderStatus,
                        });
                    }

                    // Refresh order history to show the new entry
                    await refreshOrderHistory();

                    toast.success('Státusz sikeresen frissítve!');
                } else {
                    setStatus(oldStatus); // Revert status change
                    toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
                }
            } catch (ex) {
                console.error('Error updating order status:', ex);
                setStatus(oldStatus); // Revert status change
                toast.error('Hiba történt a státusz frissítése során');
            }
        }

        if (newStatus == 'processing') {

            try {
                // Check if we're changing from pending to another status

                // If we need to remove surcharge, do it as part of the status update
                if (shouldRemoveSurcharge && editedSurcharge > 0) {
                    // Update both status and remove surcharge
                    const itemsToSave = editedItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        netPrice: item.netPrice,
                        grossPrice: item.grossPrice,
                        unit: item.unit,
                        coverUrl: item.coverUrl,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                        slug: item.slug,
                    }));

                    const { success: itemsSuccess, error: itemsUpdateError } = await updateOrderItems(
                        orderData.id,
                        itemsToSave,
                        `Státusz változtatás: ${oldStatus} -> ${newStatus}, pótdíj eltávolítva`,
                        undefined, // userId
                        undefined, // userName
                        0, // Remove surcharge
                        order?.customer.userType
                    );

                    const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
                    let newTotal = newSubtotal + (orderData.shippingCost || 0) - (orderData.discountTotal || 0);
                    if (order?.customer?.userType == 'company') {
                        newTotal += (orderData.vatTotal || 0);
                    }

                    if (!itemsSuccess) {
                        setStatus(oldStatus); // Revert status change
                        toast.error(itemsUpdateError || 'Hiba történt a pótdíj eltávolítása során');
                        return;
                    }



                    // Update local state
                    setEditedSurcharge(0);
                    if (orderData) {

                        updateOrderData({
                            ...orderData,
                            surchargeAmount: 0,
                            subtotal: newSubtotal,
                            total: newTotal,
                            orderStatus: newStatus as OrderStatus,
                        });
                    }
                }

                // Send notification email when changing to processing status
                sendNotificationEmail(orderData.notifyEmails);

                if (orderData.paymentStatus == 'paid' && orderData.simplepayDataJson && newStatus == 'processing') {
                    try {
                        const simplePayFinishResult = await finishSimplePayTransaction(orderData.id)
                        console.log('Partial charge successful:', simplePayFinishResult);
                        if (simplePayFinishResult.success !== true) {
                            throw new Error(simplePayFinishResult.error || 'A SimplePay tranzakció frissítése sikertelen.');
                        }
                    } catch (simplepayError) {
                        console.error('Partial charge failed:', simplepayError);
                        setStatus(oldStatus); // Revert status change
                        toast.warning(simplepayError instanceof Error ? simplepayError.message : 'Hiba történt a SimplePay tranzakció frissítése során');
                        return;
                    }
                }

                // Update the status
                const { success, error: statusUpdateError } = await updateOrderStatus(
                    orderData.id,
                    newStatus as OrderStatus,
                    `Státusz változtatás: ${oldStatus} -> ${newStatus}`
                );

                if (success) {
                    // Update order context
                    if (order) {
                        updateOrder({
                            ...order,
                            status: newStatus,
                        });
                    }

                    if (orderData && !shouldRemoveSurcharge) {
                        updateOrderData({
                            ...orderData,
                            orderStatus: newStatus as OrderStatus,
                        });
                    }
                    console.log('orderDData', orderData);
                    // Create invoice in Billingo if status changed to 'processing' and deny_invoice is false
                    if (newStatus === 'processing' && orderData && !orderData.denyInvoice) {
                        if (orderData.invoiceDataJson) {
                            console.log('Invoice already exists for order:', orderData.id);
                            toast.info('A számla már létre van hozva ehhez a rendeléshez. Ha módosítani szeretnéd, előbb töröld a meglévő számlát, majd próbáld újra.');
                        }
                        else if (orderData.denyInvoice) {
                            toast.info('A számla létrehozása le van tiltva ehhez a rendeléshez.');
                        }
                        else {
                            try {
                                console.log('Creating Billingo invoice for order status change:', orderData.id);
                                const invoiceResult = await createBillingoInvoiceSSR(orderData);

                                if (invoiceResult.success) {
                                    toast.success(`Számlát sikeresen létrehoztuk a Billingo rendszerben! (Számla ID: ${invoiceResult.invoiceId})`);
                                    console.log('Billingo invoice created successfully:', invoiceResult);

                                    // Save the complete invoice result (including download URL) to the database
                                    try {
                                        const { success: saveSuccess, error: saveError } = await updateOrderInvoiceData(
                                            orderData.id,
                                            invoiceResult,
                                            `Billingo számla létrehozva - ID: ${invoiceResult.invoiceId}${invoiceResult.downloadUrl ? `, URL: ${invoiceResult.downloadUrl}` : ''}`
                                        );

                                        if (saveSuccess) {
                                            console.log('Invoice data saved to database successfully');
                                        } else {
                                            console.error('Failed to save invoice data to database:', saveError);
                                            toast.warning('Számla létrehozva, de az adatok mentése sikertelen');
                                        }
                                    } catch (saveErr) {
                                        console.error('Error saving invoice data:', saveErr);
                                        toast.warning('Számla létrehozva, de az adatok mentése sikertelen');
                                    }
                                } else {
                                    console.error('Failed to create Billingo invoice:', invoiceResult.error);
                                    toast.warning(`Számla létrehozása sikertelen: ${invoiceResult.error}`);
                                }
                            } catch (invoiceError) {
                                console.error('Error creating Billingo invoice:', invoiceError);
                                toast.warning('Hiba történt a számla létrehozása során');
                            }
                        }
                    }

                    // Refresh order history to show the new entry
                    await refreshOrderHistory();

                    // Refresh shipment counts if order is cancelled or refunded


                    toast.success('Rendelés státusza sikeresen frissítve!');
                } else {
                    setStatus(oldStatus); // Revert status change
                    toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
                }
            } catch (ex) {
                console.error('Error updating order status:', ex);
                setStatus(oldStatus); // Revert status change
                toast.error('Hiba történt a státusz frissítése során');
            }

        }

        if (newStatus === 'shipping') {
            try {
                // Update the status in the database
                const { success, error: statusUpdateError } = await updateOrderStatus(
                    orderData.id,
                    newStatus as OrderStatus,
                    `Státusz változtatás: ${oldStatus} -> ${newStatus}`
                );

                if (success) {
                    // Update order context
                    if (order) {
                        updateOrder({
                            ...order,
                            status: newStatus,
                        });
                    }

                    if (orderData) {
                        updateOrderData({
                            ...orderData,
                            orderStatus: newStatus as OrderStatus,
                        });
                    }

                    // Refresh order history to show the new entry
                    await refreshOrderHistory();

                    toast.success('Státusz sikeresen frissítve!');
                } else {
                    setStatus(oldStatus); // Revert status change
                    toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
                }
            } catch (ex) {
                console.error('Error updating order status:', ex);
                setStatus(oldStatus); // Revert status change
                toast.error('Hiba történt a státusz frissítése során');
            }
        }

        if (newStatus === 'delivered') {
            try {
                // Update the status in the database
                const { success, error: statusUpdateError } = await updateOrderStatus(
                    orderData.id,
                    newStatus as OrderStatus,
                    `Státusz változtatás: ${oldStatus} -> ${newStatus}`
                );

                if (success) {
                    // Update order context
                    if (order) {
                        updateOrder({
                            ...order,
                            status: newStatus,
                        });
                    }

                    if (orderData) {
                        updateOrderData({
                            ...orderData,
                            orderStatus: newStatus as OrderStatus,
                        });
                    }

                    // Refresh order history to show the new entry
                    await refreshOrderHistory();

                    toast.success('Státusz sikeresen frissítve!');
                } else {
                    setStatus(oldStatus); // Revert status change
                    toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
                }
            } catch (ex) {
                console.error('Error updating order status:', ex);
                setStatus(oldStatus); // Revert status change
                toast.error('Hiba történt a státusz frissítése során');
            }
        }

        if ((newStatus === 'cancelled' || newStatus === 'refunded') && order?.shipmentId) {
            await refreshCounts(order.shipmentId);
        }
    }, [status, orderData, editedItems, editedSurcharge, order, updateOrder, updateOrderData, refreshOrderHistory]);

    const handleChangePaymentStatus = useCallback(async (newPaymentStatus: PaymentStatus) => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        try {
            const { success, error: paymentUpdateError } = await updateOrderPaymentStatus(
                orderData.id,
                newPaymentStatus,
                0 // paidAmount - could be extended later if needed
            );

            if (success) {
                // Update order context
                if (orderData) {
                    updateOrderData({
                        ...orderData,
                        paymentStatus: newPaymentStatus,
                    });
                }

                // Refresh order history to show the new entry
                await refreshOrderHistory();

                // Refresh shipment counts if payment status is refunded
                if (newPaymentStatus === 'refunded' && order?.shipmentId) {
                    await refreshCounts(order.shipmentId);
                }

                toast.success('Fizetési státusz sikeresen frissítve!');
            } else {
                toast.error(paymentUpdateError || 'Hiba történt a fizetési státusz frissítése során');
            }
        } catch (ex) {
            console.error('Error updating payment status:', ex);
            toast.error('Hiba történt a fizetési státusz frissítése során');
        }
    }, [orderData, updateOrderData, refreshOrderHistory]);

    useEffect(() => {
        if (pendingSave && !showPaymentAlert) {
            // If there was a pending save and the payment alert is no longer shown, proceed with save
            toast.loading('Mentés folyamatban...');
        }
    }, [pendingSave]);

    const generateHistoryEntries = useCallback((
        originalItemsParam: IOrderProductItem[],
        editedItemsParam: IOrderProductItem[],
        userType: 'public' | 'vip' | 'company'
    ): string[] => {
        const historyEntries: string[] = [];

        // Create a map of original items by ID for easier lookup
        const originalItemsMap = new Map(originalItemsParam.map(item => [item.id, item]));
        const editedItemsMap = new Map(editedItemsParam.map(item => [item.id, item]));

        // Check for new items (items in edited but not in original)
        editedItemsParam.forEach(editedItem => {
            if (!originalItemsMap.has(editedItem.id)) {
                const quantityStr = editedItem.quantity.toFixed(editedItem.quantity % 1 === 0 ? 0 : 2);
                historyEntries.push(`Új tétel: ${quantityStr} ${editedItem.unit} ${editedItem.name}`);
            }
        });

        // Check for deleted items (items in original but not in edited)
        originalItemsParam.forEach(originalItem => {
            if (!editedItemsMap.has(originalItem.id)) {
                const quantityStr = originalItem.quantity.toFixed(originalItem.quantity % 1 === 0 ? 0 : 2);
                historyEntries.push(`Törölt tétel: ${quantityStr} ${originalItem.unit} ${originalItem.name}`);
            }
        });

        // Check for modified items (quantity or price changes)
        editedItemsParam.forEach(editedItem => {
            const originalItem = originalItemsMap.get(editedItem.id);
            if (originalItem) {
                // Check quantity change
                if (originalItem.quantity !== editedItem.quantity) {
                    const oldQuantityStr = originalItem.quantity.toFixed(originalItem.quantity % 1 === 0 ? 0 : 2);
                    const newQuantityStr = editedItem.quantity.toFixed(editedItem.quantity % 1 === 0 ? 0 : 2);
                    historyEntries.push(`Módosított tétel: ${oldQuantityStr} ${editedItem.unit} -> ${newQuantityStr} ${editedItem.unit} ${editedItem.name}`);
                }

                // Check price change (use appropriate price based on user type)
                const originalPrice = (userType === 'company' || userType === 'vip') ? originalItem.netPrice : originalItem.grossPrice;
                const editedPrice = (userType === 'company' || userType === 'vip') ? editedItem.netPrice : editedItem.grossPrice;
                
                if (originalPrice !== editedPrice) {
                    historyEntries.push(`Módosult ár: ${originalPrice} Ft -> ${editedPrice} Ft ${editedItem.name}`);
                }
            }
        });

        return historyEntries;
    }, []);

    const handleStartEdit = useCallback(() => {
        if (order?.status !== 'pending') {
            return;
        }
        setIsEditing(true);
        setEditedItems([...order?.items || []]);
        setOriginalItems([...order?.items || []]);
    }, [order?.items]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditedItems(order?.items || []);
        setEditedSurcharge(orderData?.surchargeAmount || 0);
        setEditedShipping(orderData?.shippingCost || 0);
        setEditedDiscount(orderData?.discountTotal || 0);
    }, [order?.items, orderData?.surchargeAmount, orderData?.shippingCost, orderData?.discountTotal]);

    const handleSaveEdit = useCallback(async () => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        // Calculate new total
        const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotal = newSubtotal
            + editedShipping
            + (order?.customer.userType == 'company' ? orderData?.vatTotal || 0 : 0)
            + editedSurcharge
            - editedDiscount;

        // Check if payment method is 'simple' and if new total exceeds paid amount
        const isSimplePayment = orderData?.paymentMethod?.slug === 'simple';
        const payedAmount = orderData?.payedAmount || 0;

        if (isSimplePayment && newTotal > payedAmount) {
            setShowPaymentAlert(true);
            setPendingSave(true);
            return;
        }

        // Proceed with save
        await performSave();
    }, [editedItems, orderData, editedSurcharge, editedShipping, editedDiscount]);

    const performSave = useCallback(async () => {
        if (!orderData?.id) return;

        try {
            // Generate history entries for user-facing changes
            const historyEntries = generateHistoryEntries(
                originalItems,
                editedItems,
                order?.customer?.userType || 'public'
            );

            // Transform edited items to the format expected by the API
            const itemsToSave = editedItems.map(item => ({
                id: item.id,
                name: item.name,
                netPrice: item.netPrice,
                grossPrice: item.grossPrice,
                unit: item.unit,
                coverUrl: item.coverUrl,
                quantity: item.quantity,
                subtotal: item.subtotal,
                slug: item.slug,
            }));
            const { success, error: updateError } = await updateOrderItems(
                orderData.id,
                itemsToSave,
                'Rendelés tételek módosítva a dashboard-ról',
                undefined, // userId
                undefined, // userName
                editedSurcharge,
                order?.customer.userType,
                editedShipping,
                editedDiscount,
                historyEntries
            );
            if (success) {
                // Calculate new totals
                const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
                const newTotal = newSubtotal
                    + editedShipping
                    + (order?.customer.userType == 'company' ? orderData?.vatTotal || 0 : 0)
                    + editedSurcharge
                    - editedDiscount;

                // Update context with new data
                if (order) {
                    updateOrder({
                        ...order,
                        items: editedItems,
                        subtotal: newSubtotal,
                        totalAmount: newTotal,
                        shipping: editedShipping,
                        discount: editedDiscount,
                    });
                }

                // Update the history_for_user field with new entries if any were generated
                let updatedHistoryForUser = historyForUser;
                if (historyEntries.length > 0) {
                    const newEntries = historyEntries.join('\n');
                    updatedHistoryForUser = historyForUser 
                        ? `${historyForUser}\n${newEntries}` 
                        : newEntries;
                    setHistoryForUser(updatedHistoryForUser);
                }

                if (orderData) {
                    updateOrderData({
                        ...orderData,
                        items: itemsToSave,
                        subtotal: newSubtotal,
                        total: newTotal,
                        surchargeAmount: editedSurcharge,
                        shippingCost: editedShipping,
                        discountTotal: editedDiscount,
                        history_for_user: updatedHistoryForUser,
                    });
                }

                console.log('order.shipmentId', order?.shipmentId);
                if (order?.shipmentId) {
                    refreshCounts(order.shipmentId);
                }

                toast.success('Rendelés sikeresen frissítve!');
                setIsEditing(false);
                setShowPaymentAlert(false);
                setPendingSave(false);
            } else {
                toast.error(updateError || 'Hiba történt a rendelés mentése során');
            }
        } catch (ex) {
            console.error('Error saving order changes:', ex);
            toast.error('Hiba történt a rendelés mentése során');
        }
    }, [editedItems, originalItems, orderData, order, updateOrder, updateOrderData, editedSurcharge, editedShipping, editedDiscount, refreshCounts, generateHistoryEntries, historyForUser]);

    const handlePaymentAlertConfirm = useCallback(async () => {
        console.log('User confirmed save despite payment difference');
        await performSave();
    }, [performSave]);

    const handlePaymentAlertCancel = useCallback(() => {
        setShowPaymentAlert(false);
        setPendingSave(false);
    }, []);

    const handleCancellationAlertConfirm = useCallback(async () => {
        // User confirmed manual cancellation
        setShowCancellationAlert(false);

        if (!orderData?.id) return;

        try {
            // Update the status
            const { success, error: statusUpdateError } = await updateOrderStatus(
                orderData.id,
                'cancelled' as OrderStatus,
                `Rendelés törölve - kézi visszatérítés szükséges`
            );

            if (success) {
                // Update order context
                if (order) {
                    updateOrder({
                        ...order,
                        status: 'cancelled',
                    });
                }

                if (orderData) {
                    updateOrderData({
                        ...orderData,
                        orderStatus: 'cancelled' as OrderStatus,
                    });
                }

                // Refresh order history to show the new entry
                await refreshOrderHistory();

                // Refresh shipment counts for cancelled order
                if (order?.shipmentId) {
                    await refreshCounts(order.shipmentId);
                }

                setStatus('cancelled');
                toast.success('Rendelés sikeresen törölve! Kézi visszatérítés szükséges.');
            } else {
                toast.error(statusUpdateError || 'Hiba történt a státusz frissítése során');
            }
        } catch (updateError) {
            console.error('Error updating order status:', updateError);
            toast.error('Hiba történt a státusz frissítése során');
        }
    }, [orderData, order, updateOrder, updateOrderData, refreshOrderHistory]);

    const handleCancellationAlertCancel = useCallback(() => {
        setShowCancellationAlert(false);
    }, []);

    const handleItemChange = useCallback((itemId: string, field: 'netPrice' | 'grossPrice' | 'quantity', value: number) => {
        setEditedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate subtotal
                    console.log('updatedItem', updatedItem);
                    console.log('field', field);
                    console.log('value', value);

                    if (['company', 'vip'].includes(order?.customer?.userType || 'public')) {
                        updatedItem.grossPrice = Math.round(updatedItem.netPrice * (1 + updatedItem.vat / 100));
                    }
                    else {
                        updatedItem.netPrice = Math.round(updatedItem.grossPrice / (1 + updatedItem.vat / 100));
                    }

                    updatedItem.subtotal = updatedItem.grossPrice * updatedItem.quantity;

                    return updatedItem;
                }
                return item;
            })
        );
    }, []);

    const handleSurchargeChange = useCallback((newSurcharge: number) => {
        setEditedSurcharge(newSurcharge);
    }, []);

    const handleShippingChange = useCallback((newShipping: number) => {
        setEditedShipping(newShipping);
    }, []);

    const handleDiscountChange = useCallback((newDiscount: number) => {
        setEditedDiscount(newDiscount);
    }, []);

    const handleItemDelete = useCallback((itemId: string) => {
        setEditedItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleItemAdd = useCallback((products: ProductForOrder[]) => {
        // Transform ProductForOrder[] to IOrderProductItem[] and add to edited items
        console.log('products to add', products);
        const newOrderItems = products.map(product => ({
            id: !product.isCustom ? product.id : `order_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sku: product.sku,
            name: product.name,
            netPrice: product.netPrice, // Use net price as the base price
            grossPrice: order?.customer.userType == 'vip' ? product.netPrice : product.grossPrice, // Use net price as the base price
            coverUrl: product.coverUrl,
            quantity: product.quantity,
            unit: product.unit,
            vat: order?.customer.userType == 'vip' ? 0 : product.vat,
            note: product.isCustom ? 'Egyedi termék' : '',
            subtotal: (order?.customer.userType == 'company' || order?.customer.userType == 'vip' ? product.netPrice * product.quantity : product.grossPrice * product.quantity),
            slug: product.isCustom ? '' : product.id, // Use product ID as slug for existing products
        }));
        setEditedItems(prev => [...prev, ...newOrderItems]);
    }, []);

    const handleRefreshOrderHistory = useCallback(async () => {
        try {
            await refreshOrderHistory();
            toast.success('Rendelési előzmények frissítve!');
        } catch (ex) {
            console.error('Error refreshing order history:', ex);
            toast.error('Hiba történt az adatok frissítése során');
        }
    }, [refreshOrderHistory]);

    const handleSaveUserHistory = useCallback(async (newHistory: string) => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            throw new Error('Missing order ID');
        }

        try {
            const { success, error: updateError } = await updateOrderUserHistory(
                orderData.id,
                newHistory
            );

            if (success) {
                setHistoryForUser(newHistory);
                
                // Update orderData context
                if (orderData) {
                    updateOrderData({
                        ...orderData,
                        history_for_user: newHistory,
                    });
                }

                toast.success('Változási előzmények mentve!');
            } else {
                toast.error(updateError || 'Hiba történt a mentés során');
                throw new Error(updateError || 'Failed to save');
            }
        } catch (ex) {
            console.error('Error saving user history:', ex);
            toast.error('Hiba történt a mentés során');
            throw ex;
        }
    }, [orderData, updateOrderData]);

    const handleChangeDeliveryGuy = useCallback(async (newDeliveryGuyId: number | null) => {
        if (!orderId || !orderData) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        // Optimistic update - frissítjük azonnal a UI-t
        const newCourier = newDeliveryGuyId ? newDeliveryGuyId.toString() : null;
        updateOrderData({
            ...orderData,
            courier: newCourier,
        });

        // Update localStorage
        const orderLocalData = localStorage.getItem(`order-${orderId}`);
        if (orderLocalData) {
            const parsedData = JSON.parse(orderLocalData);
            parsedData.courier = newCourier;
            localStorage.setItem(`order-${orderId}`, JSON.stringify(parsedData));
        }

        // Show immediate feedback
        toast.success(
            newDeliveryGuyId 
                ? 'Futár sikeresen hozzárendelve!' 
                : 'Futár eltávolítva!'
        );

        // Update in background
        try {
            const { success, error: updateError } = await updateOrderDeliveryGuy(orderId, newDeliveryGuyId);

            if (!success) {
                // Revert on error
                toast.error(updateError || 'Hiba történt a futár frissítése során');
                await fetchOrder(orderId);
            }
        } catch (ex) {
            console.error('Error updating delivery guy:', ex);
            toast.error('Hiba történt a futár frissítése során');
            // Revert on error
            await fetchOrder(orderId);
        }
    }, [orderId, orderData, updateOrderData, fetchOrder]);

    // Calculate updated totals when in edit mode
    const displayItems = isEditing ? editedItems : order?.items || [];
    const updatedSubtotal = isEditing
        ? editedItems.reduce((sum, item) => sum + item.subtotal, 0)
        : order?.subtotal || 0;
    const updatedTotalAmount = isEditing
        ? updatedSubtotal
        + editedShipping
        + (order?.customer.userType == 'company' ? orderData?.vatTotal || 0 : 0)
        + editedSurcharge
        - editedDiscount
        : order?.totalAmount || 0;



    if (error) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="error">
                            Hiba történt a rendelés betöltése során
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    </Box>
                    <Button variant="contained" href={paths.dashboard.order.root}>
                        Vissza a rendelésekhez
                    </Button>
                </Card>
            </DashboardContent>
        );
    }

    if (loading) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Rendelés betöltése...
                    </Typography>
                </Card>
            </DashboardContent>
        );
    }

    if (!order) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">
                        Rendelés nem található
                    </Typography>
                    <Button variant="contained" href={paths.dashboard.order.root} sx={{ mt: 2 }}>
                        Vissza a rendelésekhez
                    </Button>
                </Card>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <OrderDetailsToolbar
                status={status}
                createdAt={order?.createdAt}
                orderNumber={order?.orderNumber}
                backHref={paths.dashboard.order.root}
                onChangeStatus={handleChangeStatus}
                statusOptions={ORDER_STATUS_OPTIONS}
                onChangePaymentStatus={handleChangePaymentStatus}
                paymentStatusOptions={PAYMENT_STATUS_OPTIONS}
                order={order}
                orderData={orderData}
                onStartEdit={handleStartEdit}
                isEditing={isEditing}
                deliveryGuys={deliveries.map(d => ({ id: d.id, name: d.name }))}
                currentDeliveryGuyId={orderData?.courier ? parseInt(orderData.courier, 10) : null}
                onChangeDeliveryGuy={handleChangeDeliveryGuy}
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                        sx={{
                            gap: 3,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <OrderDetailsItems
                            items={displayItems}
                            taxes={order?.taxes}
                            shipping={isEditing ? editedShipping : (orderData?.shippingCost || order?.shipping)}
                            payed_amount={orderData?.payedAmount || 0}
                            discount={isEditing ? editedDiscount : (orderData?.discountTotal || order?.discount)}
                            subtotal={updatedSubtotal}
                            totalAmount={updatedTotalAmount}
                            surcharge={isEditing ? editedSurcharge : (orderData?.surchargeAmount || 0)}
                            isEditing={isEditing}
                            isSurchargeEditable={status === 'pending'}
                            editable={status === 'pending'}
                            onItemChange={handleItemChange}
                            onItemDelete={handleItemDelete}
                            onItemAdd={handleItemAdd}
                            onSurchargeChange={handleSurchargeChange}
                            onShippingChange={handleShippingChange}
                            onDiscountChange={handleDiscountChange}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                            onStartEdit={handleStartEdit}
                            userType={order.customer.userType}
                        />

                        {/* User history card */}
                        <OrderDetailsUserHistory
                            historyForUser={historyForUser}
                            onSave={handleSaveUserHistory}
                            editable
                        />

                        {/* Show history only on desktop */}
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <OrderDetailsHistory history={order?.history} />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <OrderDetailsCustomer
                            customer={order?.customer}
                            orderData={orderData || undefined}
                            onOrderUpdate={handleRefreshOrderHistory}
                            isEditable={status === 'pending'}
                        />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsDelivery
                            delivery={order?.delivery}
                            isEditable={status === 'pending'}
                            orderId={orderData?.id}
                            customerId={orderData?.customerId || undefined}
                            onRefreshOrder={handleRefreshOrderHistory}
                            customer={order?.customer}
                            deliveryGuyId={orderData?.courier ? parseInt(orderData.courier, 10) : null}
                        />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsShipping
                            shippingAddress={order?.shippingAddress}
                            requestedShippingDate={order.planned_shipping_date_time}
                            orderId={orderData?.id}
                            customerId={orderData?.customerId || undefined}
                            onRefreshOrder={handleRefreshOrderHistory}
                            shipmentTime={orderData?.shipment_time}
                            isEditable={status === 'pending'}
                        />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsBilling
                            billingAddress={orderData?.billingAddress}
                            orderId={orderData?.id}
                            customerId={orderData?.customerId || undefined}
                            onRefreshOrder={handleRefreshOrderHistory}
                            isInvoiceCreated={!!orderData?.invoiceDataJson}
                            invoiceDataJson={orderData?.invoiceDataJson || undefined}
                            orderData={orderData || undefined}
                        />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsPayment
                            paymentMethod={orderData?.paymentMethod || null}
                            simplepayDataJson={orderData?.simplepayDataJson || null}
                            onPaymentMethodChange={handlePaymentMethodChange}
                            editable={status === 'pending'}
                        />

                        {orderData && (
                            <>
                            </>
                        )}
                    </Card>

                    {/* Admin Notes */}
                    <Box sx={{ mt: 3 }}>
                        <OrderDetailsAdminNotes
                            orderId={orderData?.id}
                            initialNote={orderData?.note || ''}
                            onNoteUpdate={handleRefreshOrderHistory}
                        />
                    </Box>

                    {/* Show history on mobile as the last card */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3 }}>
                        <OrderDetailsHistory history={order?.history} />
                    </Box>
                </Grid>
            </Grid>

            {/* Payment Alert Dialog */}
            <Dialog open={showPaymentAlert} onClose={handlePaymentAlertCancel}>
                <DialogTitle>Figyelmeztetés - Fizetési összeg túllépése</DialogTitle>
                <DialogContent>
                    <Typography>
                        Az új rendelési összeg meghaladja a már befizetett összeget.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Befizetett összeg: <strong>{orderData?.payedAmount ? `${orderData.payedAmount.toLocaleString()} Ft` : '0 Ft'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Új rendelési összeg: <strong>{updatedTotalAmount.toLocaleString()} Ft</strong>
                        </Typography>
                        <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                            Különbség: <strong>+{(updatedTotalAmount - (orderData?.payedAmount || 0)).toLocaleString()} Ft</strong>
                        </Typography>
                    </Box>
                    <Typography sx={{ mt: 2 }}>
                        Biztosan folytatni szeretnéd a mentést?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePaymentAlertCancel} color="inherit">
                        Mégse
                    </Button>
                    <Button onClick={handlePaymentAlertConfirm} variant="contained" color="warning">
                        Mentés mindenképpen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancellation Alert Dialog */}
            <Dialog open={showCancellationAlert} onClose={handleCancellationAlertCancel}>
                <DialogTitle>Figyelmeztetés - Kézi visszatérítés szükséges</DialogTitle>
                <DialogContent>
                    <Typography>
                        Nem végezhető el a fizetett összeg automatikus feloldása.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Fizetési mód: <strong>{orderData?.paymentMethod?.name || 'Ismeretlen'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fizetési állapot: <strong>Fizetve</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fizetett összeg: <strong>{orderData?.payedAmount ? `${orderData.payedAmount.toLocaleString()} Ft` : '0 Ft'}</strong>
                        </Typography>
                    </Box>
                    <Typography sx={{ mt: 2 }} color="warning.main">
                        <strong>Fontos:</strong> A visszatérítést kézzel kell lebonyolítani.
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        Biztosan folytatni szeretnéd a rendelés törlését?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancellationAlertCancel} color="inherit">
                        Mégse
                    </Button>
                    <Button onClick={handleCancellationAlertConfirm} variant="contained" color="error">
                        Igen, törlés kézi visszatérítéssel
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}
