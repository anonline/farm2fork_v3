import type { PaperProps } from '@mui/material/Paper';
import type { DialogProps } from '@mui/material/Dialog';
import type { CheckoutContextValue } from 'src/types/checkout';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { OrderCompleteIllustration } from 'src/assets/illustrations';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = DialogProps & {
    onDownloadPDF: () => void;
    onResetCart: CheckoutContextValue['onResetCart'];
};

export function CheckoutOrderComplete({ onResetCart, onDownloadPDF, slotProps, ...other }: Props) {
    const dialogPaperSx = (slotProps?.paper as PaperProps)?.sx;
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        // Get the order ID from localStorage that was stored during checkout
        const storedOrderId = localStorage.getItem('last-order-id');
        if (storedOrderId) {
            setOrderId(storedOrderId);
            // Clear it after use
            localStorage.removeItem('last-order-id');
        }
    }, []);

    const handleResetCart = () => {
        setOrderId(null);
        onResetCart();
    };

    return (
        <Dialog
            fullWidth
            fullScreen
            slotProps={{
                ...slotProps,
                paper: {
                    ...slotProps?.paper,
                    sx: [
                        {
                            width: { md: `calc(100% - 48px)` },
                            height: { md: `calc(100% - 48px)` },
                        },
                        ...(Array.isArray(dialogPaperSx) ? dialogPaperSx : [dialogPaperSx]),
                    ],
                },
            }}
            {...other}
        >
            <Box
                sx={{
                    py: 5,
                    gap: 5,
                    m: 'auto',
                    maxWidth: 480,
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    px: { xs: 2, sm: 0 },
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h4">Köszönjük a rendelését!</Typography>

                <OrderCompleteIllustration />

                <Typography>
                    Köszönjük, hogy nálunk rendelt!
                    <br />
                    <br />
                    {orderId ? (
                        <>
                            Rendelési szám: <Link sx={{ fontWeight: 'bold' }}>{orderId}</Link>
                        </>
                    ) : (
                        'Rendelési szám: Betöltés...'
                    )}
                    <br />
                    <br />
                    5 napon belül értesítést küldünk a szállításról.
                    <br /> Ha bármilyen kérdése van, ne habozzon kapcsolatba lépni velünk.{' '}
                    <br />
                    Minden jót kívánunk!
                </Typography>

                <Divider sx={{ width: 1, borderStyle: 'dashed' }} />

                <Box
                    sx={{
                        gap: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        component={RouterLink}
                        href={paths.product.root}
                        size="large"
                        color="inherit"
                        variant="outlined"
                        onClick={handleResetCart}
                        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                    >
                        Tovább vásárolok
                    </Button>

                    <Button
                        size="large"
                        variant="contained"
                        startIcon={<Iconify icon="eva:cloud-download-fill" />}
                        onClick={onDownloadPDF}
                    >
                        PDF letöltése
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
