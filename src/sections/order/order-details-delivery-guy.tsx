'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useGetDeliveries } from 'src/actions/delivery';
import { updateOrderDeliveryGuy } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { formatPhoneNumber } from 'src/sections/delivery/view/delivery-list-view';

// ----------------------------------------------------------------------

type Props = {
    orderId: string;
    currentDeliveryGuyId?: number | null;
};

export function OrderDetailsDeliveryGuy({ orderId, currentDeliveryGuyId }: Props) {
    const { deliveries, deliveriesLoading } = useGetDeliveries();
    const [selectedDeliveryGuyId, setSelectedDeliveryGuyId] = useState<number | null>(
        currentDeliveryGuyId || null
    );
    const [isUpdating, setIsUpdating] = useState(false);

    // Find the selected delivery guy details
    const selectedDeliveryGuy = deliveries.find(
        (delivery) => delivery.id === selectedDeliveryGuyId
    );

    const handleDeliveryGuyChange = useCallback(
        async (newDeliveryGuyId: number | null) => {
            if (isUpdating || newDeliveryGuyId === selectedDeliveryGuyId) return;

            setIsUpdating(true);
            try {
                const { success, error } = await updateOrderDeliveryGuy(orderId, newDeliveryGuyId);

                if (success) {
                    setSelectedDeliveryGuyId(newDeliveryGuyId);
                    toast.success(
                        newDeliveryGuyId 
                            ? 'Futár sikeresen hozzárendelve!' 
                            : 'Futár eltávolítva!'
                    );
                } else {
                    toast.error(error || 'Hiba történt a futár frissítése során.');
                }
            } catch (err) {
                console.error('Error updating delivery guy:', err);
                toast.error('Hiba történt a futár frissítése során.');
            } finally {
                setIsUpdating(false);
            }
        },
        [orderId, selectedDeliveryGuyId, isUpdating]
    );

    return (
        <>
            <CardHeader
                title="Futár hozzárendelése"
                action={
                    <IconButton>
                        <Iconify icon="solar:user-id-bold" />
                    </IconButton>
                }
            />
            <Stack spacing={2} sx={{ p: 3 }}>
                <FormControl fullWidth disabled={isUpdating || deliveriesLoading}>
                    <InputLabel id="delivery-guy-select-label">Válassz futárt</InputLabel>
                    <Select
                        labelId="delivery-guy-select-label"
                        value={selectedDeliveryGuyId || ''}
                        label="Válassz futárt"
                        onChange={(event) => {
                            const value = event.target.value;
                            handleDeliveryGuyChange(value === '' ? null : Number(value));
                        }}
                    >
                        <MenuItem value="">
                            <em>Nincs futár</em>
                        </MenuItem>
                        {deliveries.map((delivery) => (
                            <MenuItem key={delivery.id} value={delivery.id}>
                                {delivery.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedDeliveryGuy && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Futár adatai:
                        </Typography>
                        <Stack spacing={1} sx={{ typography: 'body2' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    component="span"
                                    sx={{ color: 'text.secondary', width: 80, flexShrink: 0 }}
                                >
                                    Név:
                                </Box>
                                <Typography variant="body2">{selectedDeliveryGuy.name || 'N/A'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    component="span"
                                    sx={{ color: 'text.secondary', width: 80, flexShrink: 0 }}
                                >
                                    Telefon:
                                </Box>
                                <Typography variant="body2">
                                    {formatPhoneNumber(selectedDeliveryGuy.phone) || 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}

                {deliveriesLoading && (
                    <Typography variant="body2" color="text.secondary">
                        Futárok betöltése...
                    </Typography>
                )}

                {isUpdating && (
                    <Typography variant="body2" color="text.secondary">
                        Frissítés...
                    </Typography>
                )}
            </Stack>
        </>
    );
}