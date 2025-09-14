import type { IAddress } from 'src/types/address';

import { useState, useEffect } from 'react';

import { Chip, Paper, Stack, Button, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';
import { deleteAddress, updateAddress, useGetAddresses } from 'src/actions/address';

import { toast } from 'src/components/snackbar';
import F2FIcons from 'src/components/f2ficons/f2ficons';

import { useAuthContext } from 'src/auth/hooks';

import BillingAddressKartyaEdit from './billing-address-kartya-edit';
import ShippingAddressKartyaEdit from './shipping-address-kartya-edit';

export default function ProfilAddressKartya({
    address: initialAddress,
}: Readonly<{ address: IAddress }>) {
    const { user } = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState(initialAddress);
    const { addressesMutate } = useGetAddresses(user?.id);

    // Sync local state with prop changes
    useEffect(() => {
        setAddress(initialAddress);
    }, [initialAddress]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleSave = async (updatedAddress: IAddress) => {
        console.log('Updating address:', updatedAddress);
        if (!user?.id || address.id === undefined) {
            toast.error('Hiba a cím mentésekor');
            return;
        }

        try {
            // Pass the updated address data to updateAddress
            await updateAddress(user.id, address.id, updatedAddress);
            setIsEditing(false);
            // Refresh the data first, then update local state
            await addressesMutate(); 
            toast.success('Cím sikeresen frissítve');
            // Scroll to top after successful save
            scrollToTop();
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Hiba történt a cím frissítése során');
        }
    };

    const handleCancel = async () => {
        setIsEditing(false);
        // Refresh the data to discard unsaved changes
        await addressesMutate();
        scrollToTop();
    };

    const handleDelete = async () => {
        if (!user?.id || !address.id) {
            toast.error('Hiba a cím törlésekor');
            return;
        }

        try {
            await deleteAddress(user.id, address.id);
            await addressesMutate(); // Refresh the data
            toast.success('Cím sikeresen törölve');
            // Scroll to top after successful delete
            scrollToTop();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Hiba történt a cím törlése során');
        }
    };

    if (isEditing) {
        if (address.type === 'billing') {
            return (
                <BillingAddressKartyaEdit
                    address={address}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                />
            );
        }
        return (
            <ShippingAddressKartyaEdit
                address={address}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
            />
        );
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            <Stack spacing={0.5}>
                <Typography sx={{ fontSize: '20px', fontWeight: 700, fontFamily: themeConfig.fontFamily.bricolage }}>
                    {address.fullName}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: 'rgb(75, 75, 74)' }}>
                    {address.postcode} {address.city}, {address.street} {address.houseNumber}
                    {address.type === 'shipping' && address.floor && `, ${address.floor}`}
                </Typography>
                {address.phone && (
                    <Typography sx={{ fontSize: '13px', color: 'rgb(75, 75, 74)' }}>
                        {address.phone}
                    </Typography>
                )}
                {address.type === 'billing' && address.email && (
                    <Typography sx={{ fontSize: '13px', color: 'rgb(75, 75, 74)' }}>
                        {address.email}
                    </Typography>
                )}
                {address.type === 'billing' && address.taxNumber && (
                    <Typography sx={{ fontSize: '13px', color: 'rgb(75, 75, 74)' }}>
                        Adószám: {address.taxNumber}
                    </Typography>
                )}
                {address.companyName && (
                    <Typography sx={{ fontSize: '13px', color: 'rgb(75, 75, 74)' }}>
                        {address.companyName}
                    </Typography>
                )}
            </Stack>
            <Stack spacing={1} alignItems="flex-end">
                <Button
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                    startIcon={<F2FIcons name="EditPen" height={24} width={24} />}
                    sx={{
                        borderColor: '#E0E0E0',
                        color: 'rgb(38, 38, 38)',
                        '&:hover': {
                            backgroundColor: 'black',
                            color: 'white',
                            borderColor: 'black',
                        },
                    }}
                >
                    Szerkesztés
                </Button>
                {address.isDefault && <Chip label="Alapértelmezett cím" size="small" color='primary'/>}
            </Stack>
        </Paper>
    );
}
