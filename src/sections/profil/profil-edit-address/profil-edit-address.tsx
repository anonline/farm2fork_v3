import type { SxProps } from '@mui/material';
import type { IAddress } from 'src/types/address';

import { useState } from 'react';

import {
    Box,
    Stack,
    Button,
    Divider,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
} from '@mui/material';

import { addAddress, useGetAddresses } from 'src/actions/address';

import { toast } from 'src/components/snackbar';
import F2FIcons from 'src/components/f2ficons/f2ficons';

import { useAuthContext } from 'src/auth/hooks';

import ProfilAddressKartya from './profil-address-kartya';
import NewBillingAddressForm from './new-billing-address';
import NewShippingAddressForm from './new-shipping-address';
import { themeConfig } from 'src/theme';

export default function ProfilEditAddress() {
    const { user } = useAuthContext();
    const [addressType, setAddressType] = useState<'shipping' | 'billing'>('shipping');
    const [isAdding, setIsAdding] = useState(false);

    const { addresses, addressesLoading, addressesMutate } = useGetAddresses(user?.id);

    // Get addresses for current type
    const currentAddresses = addresses
        ? addressType === 'shipping'
            ? addresses.shippingAddresses
            : addresses.billingAddresses
        : [];

    const handleAddNewAddress = async (data: any) => {
        if (!user?.id) {
            toast.error('Nincs bejelentkezve felhasználó');
            return;
        }

        try {
            // Convert form data to proper address format
            const newAddress: IAddress = {
                type: addressType,
                fullName: data.fullName,
                companyName: data.companyName || undefined,
                postcode: data.postcode,
                city: data.city,
                street: data.street,
                houseNumber: data.houseNumber,
                phone: data.phone,
                comment: data.comment || undefined,
                isDefault: data.isDefault || false,
                ...(addressType === 'shipping' && {
                    floor: data.floor || undefined,
                    doorbell: data.doorbell || undefined,
                }),
                ...(addressType === 'billing' && {
                    taxNumber: data.taxNumber || undefined,
                    email: data.email || undefined,
                }),
            } as IAddress;

            await addAddress(user.id, newAddress);
            await addressesMutate(); // Refresh the data
            setIsAdding(false);
            toast.success('Cím sikeresen hozzáadva');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Hiba történt a cím mentése során');
        }
    };

    const toggleButtonStyle: SxProps = {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '24px',
        textTransform: 'none',
        fontFamily: themeConfig.fontFamily.bricolage,
        border: '1px solid rgba(0,0,0,0)',
        borderRadius: '0px',
        px: 1,
        py: 1.5,
        color: 'text.secondary',
        '&.Mui-selected': {
            fontWeight: 700,
            borderBottom: '3px solid rgb(0, 0, 0)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
        },
    };

    const renderContent = () => {
        if (isAdding) {
            if (addressType === 'shipping') {
                return (
                    <NewShippingAddressForm
                        onSave={handleAddNewAddress}
                        onCancel={() => setIsAdding(false)}
                    />
                );
            } else {
                return (
                    <NewBillingAddressForm
                        onSave={handleAddNewAddress}
                        onCancel={() => setIsAdding(false)}
                    />
                );
            }
        }

        return (
            <>
                <Box>
                    <ToggleButtonGroup
                        value={addressType}
                        exclusive
                        onChange={(e, newType) => {
                            if (newType) {
                                setAddressType(newType);
                                setIsAdding(false);
                            }
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiToggleButtonGroup-grouped': { border: 0 },
                        }}
                    >
                        <ToggleButton value="shipping" sx={toggleButtonStyle}>
                            Kiszállítási cím
                        </ToggleButton>
                        <ToggleButton value="billing" sx={toggleButtonStyle}>
                            Számlázási cím
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Divider />
                </Box>
                <Stack spacing={2}>
                    {addressesLoading && (
                        <CircularProgress size={24} sx={{ alignSelf: 'center', mt: 2 }} />
                    )}
                    {!addressesLoading && currentAddresses.length === 0 && (
                        <Typography color="text.secondary">
                            Még nincs mentett {addressType === 'shipping' ? 'szállítási' : 'számlázási'} cím.
                        </Typography>
                    )}
                    {!addressesLoading &&
                        currentAddresses.map((addr) => (
                            <ProfilAddressKartya key={addr.id} address={addr} />
                        ))}
                </Stack>
            </>
        );
    };

    return (
        <Stack spacing={3}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
            >
                <Typography fontWeight={700} sx={{ fontSize: '32px', lineHeight: '44px' }}>
                    Címadatok
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setIsAdding(true)}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        letterSpacing: '0.16px',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: '20px',
                        bgcolor: 'rgb(70, 110, 80)',
                        gap: 1,
                        '&:hover': { bgcolor: 'rgb(60, 90, 65)' },
                    }}
                >
                    <Box sx={{ pt: 0.5 }}>
                        <F2FIcons name="Add" height={14} width={16} style={{ color: 'white' }} />
                    </Box>
                    <Box>Új cím hozzáadása</Box>
                </Button>
            </Stack>

            {renderContent()}
        </Stack>
    );
}
