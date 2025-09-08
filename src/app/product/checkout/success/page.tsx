import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { Box, Button, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { getOrderByIdSSR, updateOrderPaymentSimpleStatusSSR, updateOrderPaymentStatusSSR } from 'src/actions/order-ssr';
import { getCurrentUserSSR } from 'src/actions/auth-ssr';

import { Iconify } from 'src/components/iconify';

import { CartClearer } from './cart-clearer';
import { getSimplePayErrorMessage } from 'src/types/simplepay';

// ----------------------------------------------------------------------
//http://localhost:8082/product/checkout/success?orderId=ORD-1757249910543-8isyum1uq&r=eyJyIjoyMDEzLCJ0Ijo1MDY5NjAzODQsImUiOiJGQUlMIiwibSI6Ik9NUzUxMzI5MjA0IiwibyI6Ik9SRC0xNzU3MjQ5OTEwNTQzLThpc3l1bTF1cSJ9
// &s=j2gOjL%2FfmLoHslEqMoGw261SObdLAk0gAiqocWfjgD4mya2JJ2iS%2FKjFg1l4wW5B
export const metadata: Metadata = { title: `Payment Success - ${CONFIG.appName}` };
type SimplePayResponse = {
    r: number, //válasz kód
    t: number, // tranzakciós azonosító
    e: string, // hibaüzenet
    m: string, // státusz üzenet
    o: string // egyéb információ
}

type SuccessPageProps = {
    searchParams: Promise<{
        orderId?: string;
        status?: string;
        success?: string;
        failed?: string;
        error?: string;
        r?: string;
        s?: string; //SimplePayResponse JSON signature
    }>
}

export default async function PaymentSuccessPage({ searchParams }: Readonly<SuccessPageProps>) {
    const { orderId, status, success, failed, error: paymentError, r } = await searchParams;

    if (!orderId) {
        redirect('/');
    }



    // Get current authenticated user
    const { user: currentUser, error: authError } = await getCurrentUserSSR();

    if (authError || !currentUser) {
        console.error('User not authenticated:', authError);
        redirect('/auth/supabase/sign-in');
    }

    // Fetch order data to confirm
    const { order, error } = await getOrderByIdSSR(orderId);

    if (error || !order) {
        console.error('Error fetching order:', error);
        redirect('/');
    }

    // Check if the order belongs to the logged-in user
    if (order.customerId !== currentUser.id) {
        console.error('Order does not belong to current user:', { orderId, customerId: order.customerId, currentUserId: currentUser.id });
        redirect('/error/403');
    }

    let isPaymentSuccess = false;
    let failMessage = '';
    console.log(order.paymentMethod?.slug);

    if (order.paymentMethod?.slug === 'simple') {
        if (!r) {
            console.error('Missing SimplePay response:', { orderId });
            redirect('/');
        }

        // Decode base64 SimplePay response
        let simplePayResponse: SimplePayResponse;

        try {
            const decodedString = Buffer.from(r, 'base64').toString('utf-8');
            simplePayResponse = JSON.parse(decodedString);

            console.log('Parsed SimplePay response:', simplePayResponse);

            if (simplePayResponse.e === 'SUCCESS') {
                isPaymentSuccess = true;
            }
            else {
                failMessage = getSimplePayErrorMessage(simplePayResponse.r as any);
                console.error('SimplePay indicates payment failure:', { orderId, simplePayResponse });
            }

            await updateOrderPaymentSimpleStatusSSR(orderId, JSON.stringify(simplePayResponse));

        } catch (parseError) {
            failMessage = 'Kommunikáció a SimplePay rendszerrel sikertelen';
            console.error('Failed to parse SimplePay response:', parseError);
        }
    }
    else {
        // Determine if payment was successful or failed
        isPaymentSuccess = success === 'true' || status === 'success' || (!failed && !paymentError);
    }

    // Update payment status if successful
    if (isPaymentSuccess && order.paymentStatus !== 'paid') {
        await updateOrderPaymentStatusSSR(orderId, 'paid', order.total);
    }

    if (!isPaymentSuccess) {
        // If payment failed, show failure message
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <CartClearer shouldClear={false} />
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

                    {failMessage && (
                        <Typography variant="body2" sx={{ color: 'error.main', mb: 4 }}>
                            {failMessage}
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
            <CartClearer shouldClear={isPaymentSuccess} />
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Iconify
                    icon="solar:check-circle-bold"
                    sx={{ width: 80, height: 80, color: 'success.main', mb: 3 }}
                />

                <Typography variant="h3" sx={{ mb: 2 }}>
                    Sikeres {order.paymentMethod?.slug == 'simple'? 'fizetés és ': ''}rendelés!
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                    Köszönjük a rendelését!
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
