import type { NextRequest } from "next/server";
import type { OrderHistoryEntry } from "src/types/order-management";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { supabaseSSRCron } from "src/lib/supabase-ssr";
import { getPaymentStatus } from "src/lib/billingo-invoice";


export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSRCron(cookieStore);

    // Limit to 150 orders per run to stay well under the 300 queries/min rate limit
    // With 30-minute intervals, this ensures we can process all orders safely
    const BATCH_SIZE = 150;
    const WAITING_TIME_BETWEEN_API_CALLS_MS = 1.4; // 1.4 seconds between calls

    try {
        // Verify the request is from Vercel Cron (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            await supabase.from('cron_log').insert([{
                type: 'billingo_checkpayments',
                comment: 'Authorization error',
                created_at: new Date(),
            }]);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('Cron job started: Checking announcements...');
    } catch (error) {
        console.error('Error occurred while checking announcements:', error);
        await supabase.from('cron_log').insert([{
            type: 'billingo_checkpayments',
            comment: 'Authorization error or other error: ' + (error instanceof Error ? error.message : 'Unknown error'),
            created_at: new Date(),
        }]);

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }





    const { data: unpaidOrders } = await supabase.from('orders')
        .select('id, invoice_data_json')
        .gt('id', 50000) // Only check orders with ID greater than 50000
        .eq('payment_status', 'pending')
        .not('invoice_data_json', 'is', null)
        .order('id', { ascending: true }) // Process oldest orders first
        .limit(BATCH_SIZE);

    const { data: countAllUnpaidOrders } = await supabase.from('orders')
        .select('id, invoice_data_json')
        .gt('id', 50000) // Only check orders with ID greater than 50000
        .eq('payment_status', 'pending')
        .not('invoice_data_json', 'is', null)
        .order('id', { ascending: true });

    // Ensure invoice_data_json is not null
    if (!unpaidOrders || unpaidOrders.length === 0 || !countAllUnpaidOrders || countAllUnpaidOrders.length === 0) {
        await supabase.from('cron_log').insert([{
            type: 'billingo_checkpayments',
            comment: 'No unpaid orders found or invoice_data_json is null',
            created_at: new Date(),
        }]);

        console.log('No unpaid orders found or invoice_data_json is null');
        return NextResponse.json({ message: 'No unpaid orders found' });
    }
    console.log('Found', countAllUnpaidOrders.length, 'total unpaid orders.');
    console.log(`Processing ${unpaidOrders.length} unpaid orders...`);

    let processedCount = 0;
    let closedCount = 0;
    let errorCount = 0;
    const closedOrderIds: number[] = [];

    // Process orders sequentially to respect rate limits
    // With 50 orders and ~1.2s per call = ~60 seconds total (well under 100 queries/min)
    for (let i = 0; i < unpaidOrders.length; i += 1) {
        const order = unpaidOrders[i];

        if (!order.invoice_data_json) {
            console.log(`Skipping order ${order.id} as invoice_data_json is null`);
            continue;
        }

        const invoiceData = order.invoice_data_json;

        try {
            const { success, paid } = await getPaymentStatus(invoiceData.invoiceId);
            console.log(`[${i + 1}/${unpaidOrders.length}] Order ${order.id} - Invoice ${invoiceData.invoiceId}: ${paid ? 'PAID' : 'UNPAID'}`);

            processedCount += 1;

            if (success && paid) {
                // Update order payment status to 'closed'
                const { error } = await supabase.from('orders')
                    .update({ payment_status: 'closed' })
                    .eq('id', order.id);

                if (error) {
                    console.error(`Error updating order ${order.id} to closed:`, error);
                    errorCount += 1;
                } else {
                    console.log(`✓ Order ${order.id} marked as closed.`);
                    closedCount += 1;
                    closedOrderIds.push(order.id);
                }
            }

            // Add a small delay between API calls to be respectful of rate limits
            // This ensures we stay well under 100 queries/min
            if (i < unpaidOrders.length - 1) {
                await new Promise(resolve => { setTimeout(resolve, WAITING_TIME_BETWEEN_API_CALLS_MS); });
            }
        } catch (error) {
            console.error(`Error checking payment status for invoice ${invoiceData.invoiceId}:`, error);
            errorCount += 1;
        }
    }

    const summary = {
        message: 'Cron job executed successfully',
        processed: processedCount,
        closed: closedCount,
        errors: errorCount,
        remaining: unpaidOrders.length === BATCH_SIZE ? 'possibly more' : 0,
        all: countAllUnpaidOrders.length || 0,
        closedIds: closedOrderIds
    };

    const now = new Date();

    closedOrderIds.forEach(async (orderId) => {
        // Append to order history
        const { data: order } = await supabase.from('orders').select('history').eq('id', orderId).single();

        const history: OrderHistoryEntry[] = order?.history || [];

        const historyEntry: OrderHistoryEntry = {
            timestamp: now.toISOString(),
            status: 'closed',
            note: 'Fizetés beérkezett (automatikus ellenőrzés Billingo-ból).',
        };

        history.push(historyEntry);

        await supabase.from('orders').update({ history }).eq('id', orderId);
        console.log(`Order ${orderId} history updated with payment confirmation entry.`);
    });

    console.log('Summary:', summary);

    await supabase.from('cron_log').insert([{
        type: 'billingo_checkpayments',
        comment: JSON.stringify(summary),
        created_at: now,
    }]);

    return NextResponse.json(summary);
}