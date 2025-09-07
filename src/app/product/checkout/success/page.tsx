import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { Box, Button, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { getOrderByIdSSR, updateOrderPaymentStatusSSR } from 'src/actions/order-ssr';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Payment Success - ${CONFIG.appName}` };

type SuccessPageProps = {
    searchParams: Promise<{ 
        orderId?: string; 
        status?: string;
        success?: string;
        failed?: string;
        error?: string;
    }>
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
    const { orderId, status, success, failed, error: paymentError } = await searchParams;

    if (!orderId) {
        redirect('/');
    }

    // Fetch order data to confirm
    const { order, error } = await getOrderByIdSSR(orderId);
    
    if (error || !order) {
        console.error('Error fetching order:', error);
        redirect('/');
    }

    // Determine if payment was successful or failed
    const isPaymentSuccess = success === 'true' || status === 'success' || (!failed && !paymentError);
    
    // Update payment status if successful
    if (isPaymentSuccess && order.paymentStatus !== 'paid') {
        await updateOrderPaymentStatusSSR(orderId, 'paid', order.total);
    }
    
    if (!isPaymentSuccess) {
        // If payment failed, show failure message
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

    // Here you could update the order payment status based on the payment gateway response
    // For now, we'll assume successful payment

    return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Iconify 
                    icon="solar:check-circle-bold" 
                    sx={{ width: 80, height: 80, color: 'success.main', mb: 3 }} 
                />
                
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Sikeres fizetés!
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                    Köszönjük a rendelését! A fizetés sikeresen megtörtént.
                    <br />
                    Rendelésszám: <strong>{orderId}</strong>
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                    Hamarosan e-mailt küldünk a rendelés részleteivel és a szállítási információkkal.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        href="/"
                        startIcon={<Iconify icon="solar:home-2-outline" />}
                    >
                        Vissza a főoldalra
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        size="large"
                        href="/dashboard/orders"
                        startIcon={<Iconify icon="solar:file-text-bold" />}
                    >
                        Rendelések megtekintése
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
