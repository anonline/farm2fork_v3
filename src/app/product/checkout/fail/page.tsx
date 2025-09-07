import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { Box, Button, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { getOrderByIdSSR } from 'src/actions/order-ssr';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Payment Failed - ${CONFIG.appName}` };

type FailPageProps = {
    searchParams: Promise<{ orderId?: string; error?: string }>
}

export default async function PaymentFailPage({ searchParams }: Readonly<FailPageProps>) {
    const { orderId, error: paymentError } = await searchParams;

    if (!orderId) {
        redirect('/product/checkout');
    }

    // Fetch order data to confirm
    const { order, error } = await getOrderByIdSSR(orderId);
    
    if (error || !order) {
        console.error('Error fetching order:', error);
        redirect('/product/checkout');
    }

    return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Iconify 
                    icon="solar:close-circle-bold" 
                    sx={{ width: 80, height: 80, color: 'error.main', mb: 3 }} 
                />
                
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Sikertelen fizetés
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                    Sajnos a fizetés nem sikerült vagy megszakadt.
                    <br />
                    Rendelésszám: <strong>{orderId}</strong>
                </Typography>

                {paymentError && (
                    <Typography variant="body2" sx={{ color: 'error.main', mb: 4 }}>
                        Hiba: {paymentError}
                    </Typography>
                )}

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                    A rendelése továbbra is aktív. Próbálja meg újra a fizetést, vagy válasszon másik fizetési módot.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        href={`/product/checkout/pay?orderId=${orderId}`}
                        startIcon={<Iconify icon="solar:cart-3-bold" />}
                    >
                        Újra próbálom
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        size="large"
                        href="/product/checkout"
                        startIcon={<Iconify icon="eva:arrowhead-left-fill" />}
                    >
                        Vissza a kosárhoz
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
