import { Container } from '@mui/material'
import { redirect } from 'next/navigation'
import { startPayment } from 'simplepay-js-sdk'

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

export default async function PayPage() {

    const initSimplepay = async () => {
        try {
            const response = await startPayment({
                orderRef: 'order-12',
                total: 1212,
                currency: 'HUF', // opcionális, HUF | HUF_SZEP | EUR | USD, alapértelmezett: HUF
                customerEmail: 'rrd@webmania.cc',
                language: 'HU', // opcionális, AR | BG | CS | DE | EN | ES | FR | IT | HR | HU | PL | RO | RU | SK | TR | ZH, alapértelmezett: HU
                method: 'CARD', // opcionális, CARD | WIRE, alapértelmezett: CARD
                invoice: {
                    name: 'Radharadhya Dasa',
                    country: 'HU',
                    state: 'Budapest',
                    city: 'Budapest',
                    zip: '1234',
                    address: 'Sehol u. 0',
                },
                
            }, {
                redirectUrl: 'https://' // opcionális, alapértelmezetten a SIMPLEPAY_REDIRECT_URL környezeti változó értéke
            })
            return response as unknown as SimplepayResponse;
        } catch (error) {
            console.error('Fizetés indítása sikertelen:', error)
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