'use client';

import type { IOrderProductItem } from 'src/types/order';

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

import { ORDER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useOrderContext } from 'src/contexts/order-context';
import { updateOrderItems } from 'src/actions/order-management';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { toast } from 'src/components/snackbar';

import { OrderDetailsItems } from '../order-details-items';
import { OrderDetailsToolbar } from '../order-details-toolbar';
import { OrderDetailsHistory } from '../order-details-history';
import { OrderDetailsPayment } from '../order-details-payment';
import { OrderDetailsCustomer } from '../order-details-customer';
import { OrderDetailsDelivery } from '../order-details-delivery';
import { OrderDetailsShipping } from '../order-details-shipping';
import { OrderDetailsDeliveryGuy } from '../order-details-delivery-guy';

// ----------------------------------------------------------------------

type Props = {
  readonly orderId: string;
};

export function OrderDetailsView({ orderId }: Props) {
    const { state, updateOrder, updateOrderData, refreshOrderHistory, fetchOrder } = useOrderContext();
    const { refreshCounts } = useShipments();
    const { order, orderData, loading, error } = state;
    
    const [status, setStatus] = useState(order?.status);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<IOrderProductItem[]>(order?.items || []);
    const [editedSurcharge, setEditedSurcharge] = useState(orderData?.surchargeAmount || 0);
    const [showPaymentAlert, setShowPaymentAlert] = useState(false);
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
        }
    }, [orderData]);

    const handleChangeStatus = useCallback((newValue: string) => {
        setStatus(newValue);
    }, []);

    useEffect(() => {
        if (pendingSave && !showPaymentAlert) {
            // If there was a pending save and the payment alert is no longer shown, proceed with save
            toast.loading('Mentés folyamatban...');
        }
    }, [pendingSave]);

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
        setEditedItems([...order?.items || []]);
    }, [order?.items]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditedItems(order?.items || []);
        setEditedSurcharge(orderData?.surchargeAmount || 0);
    }, [order?.items, orderData?.surchargeAmount]);

    const handleSaveEdit = useCallback(async () => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        // Calculate new total
        const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotal = newSubtotal + (orderData?.shippingCost || 0) + (orderData?.vatTotal || 0) + editedSurcharge - (orderData?.discountTotal || 0);

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
    }, [editedItems, orderData]);

    const performSave = useCallback(async () => {
        if (!orderData?.id) return;

        try {
            // Transform edited items to the format expected by the API
            const itemsToSave = editedItems.map(item => ({
                id: parseInt(item.id, 10),
                name: item.name,
                price: item.price,
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
                editedSurcharge
            );

            if (success) {
                // Calculate new totals
                const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
                const newTotal = newSubtotal + (orderData?.shippingCost || 0) + (orderData?.vatTotal || 0) + editedSurcharge - (orderData?.discountTotal || 0);

                // Update context with new data
                if (order) {
                    updateOrder({
                        ...order,
                        items: editedItems,
                        subtotal: newSubtotal,
                        totalAmount: newTotal,
                    });
                }

                if (orderData) {
                    updateOrderData({
                        ...orderData,
                        items: itemsToSave,
                        subtotal: newSubtotal,
                        total: newTotal,
                        surchargeAmount: editedSurcharge,
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
    }, [editedItems, orderData, order, updateOrder, updateOrderData]);

    const handlePaymentAlertConfirm = useCallback(async () => {
        await performSave();
    }, [performSave]);

    const handlePaymentAlertCancel = useCallback(() => {
        setShowPaymentAlert(false);
        setPendingSave(false);
    }, []);

    const handleItemChange = useCallback((itemId: string, field: 'price' | 'quantity', value: number) => {
        setEditedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate subtotal
                    updatedItem.subtotal = updatedItem.price * updatedItem.quantity;
                    return updatedItem;
                }
                return item;
            })
        );
    }, []);

    const handleSurchargeChange = useCallback((newSurcharge: number) => {
        setEditedSurcharge(newSurcharge);
    }, []);

    const handleItemDelete = useCallback((itemId: string) => {
        setEditedItems(prev => prev.filter(item => item.id !== itemId));
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

    // Calculate updated totals when in edit mode
    const displayItems = isEditing ? editedItems : order?.items || [];
    const updatedSubtotal = isEditing
        ? editedItems.reduce((sum, item) => sum + item.subtotal, 0)
        : order?.subtotal || 0;
    const updatedTotalAmount = isEditing
        ? updatedSubtotal + (orderData?.shippingCost || 0) + (orderData?.vatTotal || 0) + editedSurcharge - (orderData?.discountTotal || 0)
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
                order={order}
                onStartEdit={handleStartEdit}
                isEditing={isEditing}
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box
                        sx={{
                            gap: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column-reverse', md: 'column' },
                        }}
                    >
                        <OrderDetailsItems
                            items={displayItems}
                            taxes={order?.taxes}
                            shipping={order?.shipping}
                            payed_amount={orderData?.payedAmount || 0}
                            discount={order?.discount}
                            subtotal={updatedSubtotal}
                            totalAmount={updatedTotalAmount}
                            surcharge={isEditing ? editedSurcharge : (orderData?.surchargeAmount || 0)}
                            isEditing={isEditing}
                            onItemChange={handleItemChange}
                            onItemDelete={handleItemDelete}
                            onSurchargeChange={handleSurchargeChange}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                            onStartEdit={handleStartEdit}
                        />

                        <OrderDetailsHistory history={order?.history} />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <OrderDetailsCustomer customer={order?.customer} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsDelivery delivery={order?.delivery} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsShipping 
                            shippingAddress={order?.shippingAddress} 
                            requestedShippingDate={order.planned_shipping_date_time}
                            orderId={orderData?.id}
                            onRefreshOrder={handleRefreshOrderHistory}
                        />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsPayment payment={order?.payment} />

                        {orderData && (
                            <>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <OrderDetailsDeliveryGuy
                                    orderId={orderData.id}
                                    currentDeliveryGuyId={(() => {
                                        if (!orderData.courier) return null;
                                        const parsedId = parseInt(orderData.courier, 10);
                                        return Number.isNaN(parsedId) ? null : parsedId;
                                    })()}
                                />
                            </>
                        )}
                    </Card>
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
        </DashboardContent>
    );
}
