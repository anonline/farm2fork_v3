import type { IAddressItem } from 'src/types/common';
import type { IOrderData } from 'src/types/order-management';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { stornoBillingoInvoiceSSR, createBillingoInvoiceSSR } from 'src/actions/billingo-ssr';
import { clearOrderInvoiceData, updateOrderInvoiceData, updateOrderBillingAddress } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { OrderBillingAddressModal } from './components/order-billing-address-modal';
import { OrderStornoConfirmationModal } from './components/order-storno-confirmation-modal';



// ----------------------------------------------------------------------

type Props = {
    billingAddress?: IAddressItem | null;
    orderId?: string;
    customerId?: string;
    onRefreshOrder?: () => void;
    isInvoiceCreated?: boolean; // Ha van invoice_data_json, akkor nem szerkeszthető
    invoiceDataJson?: Record<string, any> | null; // The actual invoice data for storno operations
    orderData?: IOrderData | null; // Full order data needed for invoice creation
};

export function OrderDetailsBilling({ 
    billingAddress, 
    orderId,
    customerId,
    onRefreshOrder,
    isInvoiceCreated = false,
    invoiceDataJson,
    orderData
}: Readonly<Props>) {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isStornoModalOpen, setIsStornoModalOpen] = useState(false);
    const [isStornoLoading, setIsStornoLoading] = useState(false);
    const [isCreateInvoiceLoading, setIsCreateInvoiceLoading] = useState(false);

    const handleEditAddressClick = () => {
        if (isInvoiceCreated) {
            toast.warning('A számlázási cím nem módosítható, mert már létrejött a számla.');
            return;
        }
        setIsAddressModalOpen(true);
    };

    const handleSaveBillingAddress = async (updatedAddress: IAddressItem) => {
        if (!orderId) {
            toast.error('Hiányzó rendelés azonosító');
            return;
        }

        if (isInvoiceCreated) {
            toast.error('A számlázási cím nem módosítható, mert már létrejött a számla.');
            return;
        }

        try {
            const result = await updateOrderBillingAddress(
                orderId,
                updatedAddress,
                'Számlázási cím módosítva az admin felületen keresztül'
            );

            if (result.error) {
                toast.error(result.error);
                return;
            }

            // Refresh order data to update the display
            onRefreshOrder?.();
            
            toast.success('Számlázási cím sikeresen frissítve!');
        } catch (error) {
            console.error('Error saving billing address:', error);
            toast.error('Hiba történt a számlázási cím mentése során');
        }
    };

    const handleStornoInvoice = async () => {
        if (!orderId || !invoiceDataJson?.invoiceId) {
            toast.error('Hiányzó adatok a sztornó művelethez');
            return;
        }

        setIsStornoLoading(true);
        
        try {
            // First, create storno invoice in Billingo
            const stornoResult = await stornoBillingoInvoiceSSR(invoiceDataJson.invoiceId);
            
            if (!stornoResult.success) {
                throw new Error(stornoResult.error || 'Sztornó hiba');
            }

            // Then clear invoice data from order
            const clearResult = await clearOrderInvoiceData(
                orderId,
                `Számla sztornózva. Sztornó számla ID: ${stornoResult.stornoInvoiceId}`,
                undefined, // userId - can be added if available
                'Admin felület'
            );

            if (!clearResult.success) {
                throw new Error(clearResult.error || 'Számlázási adatok törlése sikertelen');
            }

            // Refresh order data to update the display
            onRefreshOrder?.();
            
            toast.success(`Számla sikeresen sztornózva! Sztornó ID: ${stornoResult.stornoInvoiceId}`);
            
        } catch (error) {
            console.error('Error storning invoice:', error);
            toast.error(`Sztornó hiba: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`);
        } finally {
            setIsStornoLoading(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!orderId || !orderData) {
            toast.error('Hiányzó adatok a számla készítéshez');
            return;
        }
        console.log('Creating invoice for orderData from button:', orderData);
        setIsCreateInvoiceLoading(true);
        
        try {
            // Create invoice using existing Billingo function
            const invoiceResult = await createBillingoInvoiceSSR(orderData);
            
            if (!invoiceResult.success) {
                throw new Error(invoiceResult.error || 'Számla létrehozási hiba');
            }

            // Save invoice data to order
            const updateResult = await updateOrderInvoiceData(
                orderId,
                invoiceResult,
                `Számla létrehozva. Számla ID: ${invoiceResult.invoiceId}`,
                undefined, // userId - can be added if available
                'Admin felület'
            );

            if (!updateResult.success) {
                throw new Error(updateResult.error || 'Számla adatok mentése sikertelen');
            }

            // Refresh order data to update the display
            onRefreshOrder?.();
            
            toast.success(`Számla sikeresen létrehozva! Számla ID: ${invoiceResult.invoiceId}`);
            
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error(`Számla hiba: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`);
        } finally {
            setIsCreateInvoiceLoading(false);
        }
    };

    // Determine if create invoice button should be shown
    const canCreateInvoice = orderData && 
        !isInvoiceCreated && 
        !invoiceDataJson && 
        !orderData.denyInvoice &&
        orderData.orderStatus !== 'pending' && 
        orderData.orderStatus !== 'cancelled' && 
        orderData.orderStatus !== 'refunded';

    return (
        <>
            <CardHeader
                title="Számlázási adatok"
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Create Invoice button - show when conditions are met */}
                        {canCreateInvoice && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={handleCreateInvoice}
                                disabled={isCreateInvoiceLoading}
                            >
                                {isCreateInvoiceLoading ? 'Készítés...' : 'Számla készítés'}
                            </Button>
                        )}

                        {/* Storno button - show only if invoice exists */}
                        {isInvoiceCreated && invoiceDataJson && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => setIsStornoModalOpen(true)}
                                disabled={isStornoLoading}
                                startIcon={<Iconify icon="solar:pen-bold" />}
                            >
                                Sztornó
                            </Button>
                        )}
                        
                        {/* Edit address button */}
                        <IconButton 
                            onClick={handleEditAddressClick}
                            disabled={isInvoiceCreated}
                            sx={{ 
                                opacity: isInvoiceCreated ? 0.5 : 1,
                                cursor: isInvoiceCreated ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    </Box>
                }
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                {isInvoiceCreated && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="warning.main" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5 
                        }}>
                            <Iconify icon="solar:lock-password-outline" width={14} />
                            A számla már létrejött, ezért nem szerkeszthető
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: { xs: '100%', md: 120 }, flexShrink: 0 }}
                    >
                        Név
                    </Box>
                    {billingAddress?.name || '-'}
                </Box>

                {billingAddress?.company && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: { xs: '100%', md: 120 }, flexShrink: 0 }}
                        >
                            Cég
                        </Box>
                        {billingAddress.company}
                    </Box>
                )}

                {billingAddress?.taxNumber && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: { xs: '100%', md: 120 }, flexShrink: 0 }}
                        >
                            Adószám
                        </Box>
                        {billingAddress.taxNumber}
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: { xs: '100%', md: 120 }, flexShrink: 0 }}
                    >
                        Cím
                    </Box>
                    {billingAddress?.fullAddress || 
                     `${billingAddress?.postcode || ''} ${billingAddress?.city || ''} ${billingAddress?.street || ''} ${billingAddress?.houseNumber || ''}${billingAddress?.floor ? `, ${billingAddress.floor}` : ''}${billingAddress?.doorbell ? `, ${billingAddress.doorbell}` : ''}`.trim() || 
                     '-'
                    }
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Telefonszám
                    </Box>
                    {billingAddress?.phoneNumber || '-'}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Szám. e-mail
                    </Box>
                    {billingAddress?.email || '-'}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Megjegyzés
                    </Box>
                    {billingAddress?.note || '-'}
                </Box>
            </Stack>

            {/* Billing Address Modal */}
            <OrderBillingAddressModal
                open={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                currentAddress={billingAddress}
                customerId={customerId}
                onSave={handleSaveBillingAddress}
            />

            {/* Storno Confirmation Modal */}
            <OrderStornoConfirmationModal
                open={isStornoModalOpen}
                onClose={() => setIsStornoModalOpen(false)}
                onConfirm={handleStornoInvoice}
                invoiceNumber={invoiceDataJson?.invoiceNumber || invoiceDataJson?.invoiceId?.toString()}
                loading={isStornoLoading}
            />
        </>
    );
}