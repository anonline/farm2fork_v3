import type { NextRequest} from 'next/server';

import { NextResponse } from 'next/server';

import { updateOrderPaymentStatus } from 'src/actions/order-management';

// SimplePay webhook endpoint to handle payment notifications
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const data = JSON.parse(body);

        // Verify the webhook signature if SimplePay provides one
        // This is important for security in production
        
        const { orderRef, status, total } = data;

        if (!orderRef) {
            return NextResponse.json({ error: 'Missing orderRef' }, { status: 400 });
        }

        // Update order payment status based on SimplePay response
        let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
        
        switch (status) {
            case 'FINISHED':
            case 'SUCCESS':
                paymentStatus = 'paid';
                break;
            case 'TIMEOUT':
            case 'FAIL':
            case 'CANCEL':
                paymentStatus = 'failed';
                break;
            case 'REFUND':
                paymentStatus = 'refunded';
                break;
            default:
                paymentStatus = 'pending';
        }

        // Update the order payment status
        const { error } = await updateOrderPaymentStatus(
            orderRef, 
            paymentStatus, 
            paymentStatus === 'paid' ? total : undefined
        );

        if (error) {
            console.error('Error updating order payment status:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        console.log(`Payment status updated for order ${orderRef}: ${paymentStatus}`);
        
        // SimplePay expects a specific response format
        return NextResponse.json({ 
            message: 'Payment status updated successfully',
            orderRef,
            status: paymentStatus
        });

    } catch (error) {
        console.error('Error processing SimplePay webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Handle GET request for webhook verification
export async function GET() {
    return NextResponse.json({ message: 'SimplePay webhook endpoint' });
}
