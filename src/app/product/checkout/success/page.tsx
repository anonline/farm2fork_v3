import type { Metadata } from 'next';
import type { OrderHistoryEntry } from 'src/types/order-management';

import { redirect } from 'next/navigation';

import { Box, Alert, Button, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { getCurrentUserSSR } from 'src/actions/auth-ssr';
import { getOrderByIdSSR, addOrderHistorySSR, updateOrderPaymentStatusSSR, updateOrderPaymentSimpleStatusSSR } from 'src/actions/order-ssr';

import { Iconify } from 'src/components/iconify';

import { getSimplePayErrorMessage } from 'src/types/simplepay';

import { CartClearer } from './cart-clearer';

// ----------------------------------------------------------------------

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
    let transactionId = 0;
    let failMessageForUser = '';

    if (order.paymentMethod?.slug === 'simple' && order.paymentStatus == 'pending') {
        if (!r) {
            console.error('Missing SimplePay response:', { orderId });
            redirect('/');
        }

        // Decode base64 SimplePay response
        let simplePayResponse: SimplePayResponse;
        let historyEntry: OrderHistoryEntry;

        try {
            const decodedString = Buffer.from(r, 'base64').toString('utf-8');
            simplePayResponse = JSON.parse(decodedString);
            transactionId = simplePayResponse.t;

            if (simplePayResponse.e === 'SUCCESS') {
                isPaymentSuccess = true;

                historyEntry = {
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                    note: 'Fizetés sikeres a SimplePay-en keresztül',
                };
            }
            else {
                switch (simplePayResponse.e){
                    case 'FAIL':
                        failMessageForUser = 'Kérjük, ellenőrizze a tranzakció során megadott adatok helyességét. Amennyiben minden adatot helyesen adott meg, a visszautasítás okának kivizsgálása érdekében kérjük, szíveskedjen kapcsolatba lépni a kártyakibocsátó bankjával.';
                        break;
                    case 'TIMEOUT':
                        failMessageForUser = 'Ön túllépte a tranzakció elindításának lehetséges maximális idejét.';
                        break;
                    case 'CANCEL':
                        failMessageForUser = 'Ön megszakította a fizetést.';
                        break;
                    default:
                        failMessageForUser = 'Ismeretlen hiba.';
                }

                failMessage = getSimplePayErrorMessage(simplePayResponse.r as any);
                console.error('SimplePay indicates payment failure:', { orderId, simplePayResponse });
                
                historyEntry = {
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                    note: `Fizetés sikertelen a SimplePay-en keresztül: ${failMessage}`,
                };
            }

            await updateOrderPaymentSimpleStatusSSR(orderId, JSON.stringify(simplePayResponse));

        } catch (parseError) {
            failMessage = 'Kommunikáció a SimplePay rendszerrel sikertelen';
            console.error('Failed to parse SimplePay response:', parseError);

            historyEntry = {
                timestamp: new Date().toISOString(),
                status: 'pending',
                note: `Fizetés hiba a SimplePay-en keresztül: ${failMessage}`,
            };
        }

        await addOrderHistorySSR(orderId, historyEntry);
    }
    else {
        // Determine if payment was successful or failed
        isPaymentSuccess = success === 'true' || status === 'success' || (!failed && !paymentError);
    }

    // Update payment status if successful
    if (isPaymentSuccess && order.paymentStatus == 'pending') {
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
                        Sikertelen rendelés
                    </Typography>

                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                        Sajnos a rendelés nem sikerült vagy megszakadt.
                        <br />
                        Rendelésszám: <strong>{orderId}</strong>
                        {transactionId ? <> <br />SimplePay tranzakció azonosító: <strong>{transactionId}</strong></> : null}
                    </Typography>

                    {failMessageForUser && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {failMessageForUser}
                        </Alert>
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
                    {transactionId ? <> <br />SimplePay tranzakció azonosító: <strong>{transactionId}</strong></> : null}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                    Hamarosan e-mailt küldünk a rendelés részleteivel és a szállítási információkkal.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        href="/"
                    >
                        Vissza a főoldalra
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        href={paths.profile.orders}
                        startIcon={<Iconify icon="solar:file-text-bold" />}
                    >
                        Rendelések megtekintése
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
