'use client';

import type { IOrderData } from 'src/types/order-management';
import type { IOrderItem, IOrderProductItem } from 'src/types/order';

import { useState, useCallback } from 'react';

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

import { paths } from 'src/routes/paths';

import { ORDER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { updateOrderItems } from 'src/actions/order-management';

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
    readonly order?: IOrderItem;
    readonly orderData?: IOrderData;
    readonly orderError?: string | null;
};

export function OrderDetailsView({ order, orderData, orderError }: Props) {
    const [status, setStatus] = useState(order?.status);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItems, setEditedItems] = useState<IOrderProductItem[]>(order?.items || []);
    const [editedSurcharge, setEditedSurcharge] = useState(orderData?.surchargeAmount || 0);
    const [showPaymentAlert, setShowPaymentAlert] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);

    // Local state to track updated order data after save
    const [localOrder, setLocalOrder] = useState(order);
    const [localOrderData, setLocalOrderData] = useState(orderData);

    // Use local state if available, otherwise fall back to props
    const currentOrder = localOrder || order;
    const currentOrderData = localOrderData || orderData;

    const handleChangeStatus = useCallback((newValue: string) => {
        setStatus(newValue);
    }, []);

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
        setEditedItems([...currentOrder?.items || []]);
    }, [currentOrder?.items]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditedItems(order?.items || []);
        setEditedSurcharge(orderData?.surchargeAmount || 0);
    }, [order?.items, orderData?.surchargeAmount]);

    const handleSaveEdit = useCallback(async () => {
        if (!currentOrderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        // Calculate new total
        const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotal = newSubtotal + (currentOrderData?.shippingCost || 0) + (currentOrderData?.vatTotal || 0) + editedSurcharge - (currentOrderData?.discountTotal || 0);

        // Check if payment method is 'simple' and if new total exceeds paid amount
        const isSimplePayment = currentOrderData?.paymentMethod?.slug === 'simple';
        const payedAmount = currentOrderData?.payedAmount || 0;

        if (isSimplePayment && newTotal > payedAmount) {
            setShowPaymentAlert(true);
            setPendingSave(true);
            return;
        }

        // Proceed with save
        await performSave();
    }, [editedItems, currentOrderData]);

    const performSave = useCallback(async () => {
        if (!currentOrderData?.id) return;

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

            const { success, error } = await updateOrderItems(
                currentOrderData.id,
                itemsToSave,
                'Rendelés tételek módosítva a dashboard-ról',
                undefined, // userId
                undefined, // userName
                editedSurcharge
            );

            if (success) {
                // Calculate new totals
                const newSubtotal = editedItems.reduce((sum, item) => sum + item.subtotal, 0);
                const newTotal = newSubtotal + (currentOrderData?.shippingCost || 0) + (currentOrderData?.vatTotal || 0) + editedSurcharge - (currentOrderData?.discountTotal || 0);

                // Update local order state with new data
                if (currentOrder) {
                    setLocalOrder({
                        ...currentOrder,
                        items: editedItems,
                        subtotal: newSubtotal,
                        totalAmount: newTotal,
                    });
                }

                if (currentOrderData) {
                    setLocalOrderData({
                        ...currentOrderData,
                        items: itemsToSave,
                        subtotal: newSubtotal,
                        total: newTotal,
                        surchargeAmount: editedSurcharge,
                    });
                }

                toast.success('Rendelés sikeresen frissítve!');
                setIsEditing(false);
                setShowPaymentAlert(false);
                setPendingSave(false);
            } else {
                toast.error(error || 'Hiba történt a rendelés mentése során');
            }
        } catch (error) {
            console.error('Error saving order changes:', error);
            toast.error('Hiba történt a rendelés mentése során');
        }
    }, [editedItems, currentOrderData, currentOrder]);

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

    // Calculate updated totals when in edit mode
    const displayItems = isEditing ? editedItems : currentOrder?.items || [];
    const updatedSubtotal = isEditing
        ? editedItems.reduce((sum, item) => sum + item.subtotal, 0)
        : currentOrder?.subtotal || 0;
    const updatedTotalAmount = isEditing
        ? updatedSubtotal + (currentOrderData?.shippingCost || 0) + (currentOrderData?.vatTotal || 0) + editedSurcharge - (currentOrderData?.discountTotal || 0)
        : currentOrder?.totalAmount || 0;

    if (orderError) {
        return (
            <DashboardContent>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="error">
                            Hiba történt a rendelés betöltése során
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {orderError}
                        </Typography>
                    </Box>
                    <Button variant="contained" href={paths.dashboard.order.root}>
                        Vissza a rendelésekhez
                    </Button>
                </Card>
            </DashboardContent>
        );
    }

    if (!currentOrder) {
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
                createdAt={currentOrder?.createdAt}
                orderNumber={currentOrder?.orderNumber}
                backHref={paths.dashboard.order.root}
                onChangeStatus={handleChangeStatus}
                statusOptions={ORDER_STATUS_OPTIONS}
                order={currentOrder}
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
                            taxes={currentOrder?.taxes}
                            shipping={currentOrder?.shipping}
                            payed_amount={currentOrderData?.payedAmount || 0}
                            discount={currentOrder?.discount}
                            subtotal={updatedSubtotal}
                            totalAmount={updatedTotalAmount}
                            surcharge={isEditing ? editedSurcharge : (currentOrderData?.surchargeAmount || 0)}
                            isEditing={isEditing}
                            onItemChange={handleItemChange}
                            onItemDelete={handleItemDelete}
                            onSurchargeChange={handleSurchargeChange}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                            onStartEdit={handleStartEdit}
                        />

                        <OrderDetailsHistory history={currentOrder?.history} />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <OrderDetailsCustomer customer={currentOrder?.customer} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsDelivery delivery={currentOrder?.delivery} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsShipping shippingAddress={currentOrder?.shippingAddress} />

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <OrderDetailsPayment payment={currentOrder?.payment} />

                        {currentOrderData && (
                            <>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <OrderDetailsDeliveryGuy
                                    orderId={currentOrderData.id}
                                    currentDeliveryGuyId={currentOrderData.courier ? (Number.isNaN(parseInt(currentOrderData.courier, 10)) ? null : parseInt(currentOrderData.courier, 10)) : null}
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
                            Befizetett összeg: <strong>{currentOrderData?.payedAmount ? `${currentOrderData.payedAmount.toLocaleString()} Ft` : '0 Ft'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Új rendelési összeg: <strong>{updatedTotalAmount.toLocaleString()} Ft</strong>
                        </Typography>
                        <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                            Különbség: <strong>+{(updatedTotalAmount - (currentOrderData?.payedAmount || 0)).toLocaleString()} Ft</strong>
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
