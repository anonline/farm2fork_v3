import type { IOrderCustomer } from 'src/types/order';
import type { IOrderData } from 'src/types/order-management';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { Switch, TextField, FormControlLabel } from '@mui/material';

import { updateOrderCustomer, updateOrderInvoiceSettings } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomerSelectionModal } from 'src/components/customer-selection-modal';

// ----------------------------------------------------------------------

type Props = {
    customer?: IOrderCustomer;
    orderData?: IOrderData;
    onOrderUpdate?: () => void;
    isEditable?: boolean;
};

export function OrderDetailsCustomer({ customer, orderData, onOrderUpdate, isEditable = true }: Readonly<Props>) {
    // Local state for form controls
    const [denyInvoice, setDenyInvoice] = useState(orderData?.denyInvoice || false);
    const [paymentDueDays, setPaymentDueDays] = useState(orderData?.paymentDueDays?.toString() || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);

    // Handle invoice switch change
    const handleInvoiceChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDenyInvoice = !event.target.checked; // Switch shows "Számla kiállítása" so we invert
        setDenyInvoice(newDenyInvoice);

        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        setIsUpdating(true);
        try {
            const { success, error } = await updateOrderInvoiceSettings(
                orderData.id,
                newDenyInvoice,
                undefined, // Don't update payment due days here
                `Számla beállítás módosítva: ${newDenyInvoice ? 'tiltva' : 'engedélyezve'}`
            );

            if (success) {
                toast.success('Számla beállítás frissítve');
                onOrderUpdate?.();
            } else {
                toast.error(error || 'Hiba történt a frissítés során');
                setDenyInvoice(orderData.denyInvoice || false); // Revert on error
            }
        } catch (error) {
            console.error('Error updating invoice setting:', error);
            toast.error('Hiba történt a frissítés során');
            setDenyInvoice(orderData.denyInvoice || false); // Revert on error
        } finally {
            setIsUpdating(false);
        }
    }, [orderData, onOrderUpdate]);

    // Handle payment due days change
    const handlePaymentDueDaysChange = useCallback(async (event: React.FocusEvent<HTMLInputElement>) => {
        const newPaymentDueDays = event.target.value;
        const parsedDays = parseInt(newPaymentDueDays, 10);

        // Validate input
        if (newPaymentDueDays && (isNaN(parsedDays) || parsedDays < 0)) {
            toast.error('A fizetési határidő pozitív szám kell legyen');
            setPaymentDueDays(orderData?.paymentDueDays?.toString() || ''); // Revert
            return;
        }

        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        // Only update if value changed
        if (parsedDays === orderData.paymentDueDays) {
            return;
        }

        setIsUpdating(true);
        try {
            const { success, error } = await updateOrderInvoiceSettings(
                orderData.id,
                orderData.denyInvoice || false, // Keep current invoice setting
                parsedDays || 0,
                `Fizetési határidő módosítva: ${parsedDays || 0} nap`
            );

            if (success) {
                toast.success('Fizetési határidő frissítve');
                onOrderUpdate?.();
            } else {
                toast.error(error || 'Hiba történt a frissítés során');
                setPaymentDueDays(orderData.paymentDueDays?.toString() || ''); // Revert on error
            }
        } catch (error) {
            console.error('Error updating payment due days:', error);
            toast.error('Hiba történt a frissítés során');
            setPaymentDueDays(orderData.paymentDueDays?.toString() || ''); // Revert on error
        } finally {
            setIsUpdating(false);
        }
    }, [orderData, onOrderUpdate]);

    // Handle customer selection from modal
    const handleCustomerSelect = useCallback(async (newCustomer: IOrderCustomer) => {
        if (!orderData?.id) {
            toast.error('Hiányzó rendelési azonosító');
            return;
        }

        setIsUpdating(true);
        try {
            const { success, error } = await updateOrderCustomer(
                orderData.id,
                newCustomer.id,
                newCustomer.name,
                `Vásárló módosítva: ${customer?.name} → ${newCustomer.name}`
            );

            if (success) {
                toast.success(`Vásárló sikeresen módosítva: ${newCustomer.name}`);
                onOrderUpdate?.(); // Refresh order data
            } else {
                toast.error(error || 'Hiba történt a vásárló módosítása során');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Hiba történt a vásárló módosítása során');
        } finally {
            setIsUpdating(false);
        }
    }, [orderData, customer, onOrderUpdate]);

    // Update local state when orderData changes (from external updates)
    useEffect(() => {
        setDenyInvoice(orderData?.denyInvoice || false);
        setPaymentDueDays(orderData?.paymentDueDays?.toString() || '');
    }, [orderData]);

    return (
        <>
            <CardHeader
                title="Vásárló"
                action={
                    isEditable && (
                        <IconButton 
                            disabled={isUpdating}
                            onClick={() => setCustomerModalOpen(true)}
                        >
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )
                }
            />
            <Box sx={{ p: 3, display: 'flex' }}>
                <Avatar
                    color={
                        customer?.userType === "public" && "default" ||
                        customer?.userType === "vip" && "warning" ||
                         "primary"
                        } sx={{ width: 48, height: 48, mr: 2 }}
                >
                    <Iconify icon={
                        customer?.userType == 'public' && "solar:user-rounded-bold" ||
                        customer?.userType == 'vip' && "eva:star-fill" ||
                        "solar:buildings-3-line-duotone"
                    } width={24} height={24} />
                </Avatar>

                <Stack spacing={0.5} sx={{ typography: 'body2', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2">{customer?.name}</Typography>

                    <Box sx={{ color: 'text.secondary' }}>{customer?.email}</Box>

                    {/* Invoice switch - inverted logic since it asks "Számla kiállítása" */}
                    <FormControlLabel
                        checked={!denyInvoice} // Show checked when invoice is NOT denied
                        label="Számla kiállítása"
                        disabled={isUpdating}
                        control={
                            <Switch 
                                slotProps={{ input: { id: `invoice-switch` } }}
                                onChange={handleInvoiceChange}
                            />
                        }
                    />

                    {/* Payment due days field - only show if payment method is wire transfer */}
                    {orderData?.paymentMethod?.type === 'wire' && (
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Fizetési határidő (nap)"
                            placeholder="0"
                            value={paymentDueDays}
                            disabled={isUpdating}
                            onChange={(e) => setPaymentDueDays(e.target.value)}
                            onBlur={handlePaymentDueDaysChange}
                            sx={{ mt: 1 }}
                            type="number"
                            inputProps={{ min: 0 }}
                        />
                    )}
                </Stack>
            </Box>

            {/* Customer Selection Modal */}
            <CustomerSelectionModal
                open={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onSelectCustomer={handleCustomerSelect}
                currentCustomerId={customer?.id}
            />
        </>
    );
}
