import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { checkSignature, generateSignature } from 'simplepay-js-sdk';

// SimplePay IPN endpoint to handle instant payment notifications
export async function POST(request: NextRequest) {
    try {
        // Get the signature from the header
        const signatureHeader = request.headers.get('Signature') || request.headers.get('signature');
        
        if (!signatureHeader) {
            console.error('Missing signature header in IPN request');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Get the raw body
        const ipnBody = await request.text();
        
        if (!ipnBody) {
            console.error('Empty IPN body received');
            return NextResponse.json({ error: 'Empty body' }, { status: 400 });
        }

        // Get the merchant key from environment
        const SIMPLEPAY_MERCHANT_KEY_HUF = process.env.SIMPLEPAY_MERCHANT_KEY_HUF;
        
        if (!SIMPLEPAY_MERCHANT_KEY_HUF) {
            console.error('Missing SIMPLEPAY_MERCHANT_KEY_HUF environment variable');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Validate the signature
        const isValidSignature = checkSignature(ipnBody, signatureHeader, SIMPLEPAY_MERCHANT_KEY_HUF);
        
        if (!isValidSignature) {
            console.error('Invalid signature in IPN request');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse the JSON payload
        let ipnData;
        try {
            ipnData = JSON.parse(ipnBody);
        } catch (parseError) {
            console.error('Invalid JSON in IPN body:', parseError);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // Add receiveDate property to the response
        const responseData = {
            ...ipnData,
            receiveDate: new Date().toISOString()
        };

        // Convert response to JSON string
        const responseText = JSON.stringify(responseData);

        // Generate new signature for the response
        const newSignature = generateSignature(responseText, SIMPLEPAY_MERCHANT_KEY_HUF);

        console.log('IPN processed successfully:', {
            orderRef: ipnData.orderRef,
            transactionId: ipnData.transactionId,
            receiveDate: responseData.receiveDate
        });

        // Return the response with the new signature header
        return new NextResponse(responseText, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Signature': newSignature
            }
        });

    } catch (error) {
        console.error('Error processing SimplePay IPN:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}