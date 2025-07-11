import type { IOrderShippingAddress } from 'src/types/order';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    shippingAddress?: IOrderShippingAddress;
};

export function OrderDetailsShipping({ shippingAddress }: Props) {
    return (
        <>
            <CardHeader
                title="Szállítási adatok"
                action={
                    <IconButton>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                }
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                <Box sx={{ display: 'flex' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Cím
                    </Box>

                    {shippingAddress?.fullAddress}
                </Box>

                <Box sx={{ display: 'flex' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Telefonszám
                    </Box>

                    {shippingAddress?.phoneNumber}
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Megjegyzés
                    </Box>
                    -
                </Box>
            </Stack>
        </>
    );
}
