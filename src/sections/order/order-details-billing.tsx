import type { IAddressItem } from 'src/types/common';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { updateOrderBillingAddress } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { OrderBillingAddressModal } from './components/order-billing-address-modal';



// ----------------------------------------------------------------------

type Props = {
    billingAddress?: IAddressItem | null;
    orderId?: string;
    customerId?: string;
    onRefreshOrder?: () => void;
    isInvoiceCreated?: boolean; // Ha van invoice_data_json, akkor nem szerkeszthető
};

export function OrderDetailsBilling({ 
    billingAddress, 
    orderId,
    customerId,
    onRefreshOrder,
    isInvoiceCreated = false
}: Readonly<Props>) {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

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

    return (
        <>
            <CardHeader
                title="Számlázási adatok"
                action={
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
        </>
    );
}