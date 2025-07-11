import type { IOrderPayment } from 'src/types/order';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    payment?: IOrderPayment;
};

export function OrderDetailsPayment({ payment }: Props) {
    return (
        <>
            <CardHeader
                title="Fizetési mód"
                action={
                    <IconButton>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                }
            />
            <Box
                sx={{
                    p: 3,
                    gap: 0.5,
                    display: 'flex',
                    typography: 'body2',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                {payment?.cardNumber}
                <Iconify icon="payments:mastercard" width={36} height="auto" />
            </Box>
        </>
    );
}
