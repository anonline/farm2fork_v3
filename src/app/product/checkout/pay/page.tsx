import { redirect } from 'next/navigation'
import { startPayment } from 'simplepay-js-sdk'

import { Container } from '@mui/material'

import { getOrderByIdSSR } from 'src/actions/order-ssr'
import { getCurrentUserSSR } from 'src/actions/auth-ssr'

type SimplepayResponse = {
  transactionId: number,
  orderRef: string,
  merchant: string,
  timeout: string,
  total: number,
  paymentUrl: string,
  currency: string,
  salt: string
}

type PayPageProps = {
    searchParams: Promise<{ orderId?: string }>
}

export default async function PayPage({ searchParams }: Readonly<PayPageProps>) {
    const { orderId } = await searchParams;

    if (!orderId) {
        redirect('/product/checkout');
    }

    // Get current authenticated user
    const { user: currentUser, error: authError } = await getCurrentUserSSR();
    
    if (authError || !currentUser) {
        console.error('User not authenticated:', authError);
        redirect('/auth/supabase/sign-in');
    }

    // Fetch order data
    const { order, error } = await getOrderByIdSSR(orderId);
    
    if (error || !order) {
        console.error('Error fetching order:', error);
        redirect('/product/checkout');
    }

    // Check if the order belongs to the logged-in user
    if (order.customerId !== currentUser.id) {
        console.error('Order does not belong to current user:', { orderId, customerId: order.customerId, currentUserId: currentUser.id });
        redirect('/error/403');
    }

    const initSimplepay = async () => {
        try {
            // Extract billing information from order
            const billingAddress = order.billingAddress || order.shippingAddress;
            const customerEmail = order.billingEmails?.[0] || order.notifyEmails?.[0] || 'noreply@farm2fork.hu';
            
            const response = await startPayment({
                orderRef: orderId,
                total: Math.round(order.total), // Ensure integer for payment gateway
                currency: 'HUF', // opcionális, HUF | HUF_SZEP | EUR | USD, alapértelmezett: HUF
                customerEmail,
                language: 'HU', // opcionális, AR | BG | CS | DE | EN | ES | FR | IT | HR | HU | PL | RO | RU | SK | TR | ZH, alapértelmezett: HU
                method: 'CARD', // opcionális, CARD | WIRE, alapértelmezett: CARD
                invoice: {
                    name: billingAddress?.name || order.customerName || 'Unknown Customer',
                    country: 'HU',
                    state: 'Hungary',
                    city: billingAddress?.fullAddress?.split(',')[1]?.trim() || 'Budapest',
                    zip: billingAddress?.fullAddress?.split(' ')[0] || '1234',
                    address: billingAddress?.fullAddress || 'Sehol u. 0',
                },
                
            }, {
                redirectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8082'}/product/checkout/success?orderId=${orderId}` // opcionális, alapértelmezetten a SIMPLEPAY_REDIRECT_URL környezeti változó értéke
            })
            return response as unknown as SimplepayResponse;
        } catch (ex) {
            console.error('Fizetés indítása sikertelen:', ex)
            return null;
        }
    }

    const simplepayResponse = await initSimplepay();
    console.log('simplepayResponse', simplepayResponse);

    if (simplepayResponse?.paymentUrl) {
        redirect(simplepayResponse.paymentUrl);
    }

    return <Container>Átirányítás a fizetési oldalra...</Container>;
}