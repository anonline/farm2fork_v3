import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "src/lib/billingo-invoice";
import { supabaseSSR } from "src/lib/supabase-ssr";


export async function GET(request: NextRequest) {
      try {
        // Verify the request is from Vercel Cron (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          //return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        console.log('Cron job started: Checking announcements...');
    } catch (error) {
        console.error('Error occurred while checking announcements:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const { data: unpaidOrders } = await supabase.from('orders')
        .select('id, invoice_data_json')
        .gt('id', 50000) // Only check orders with ID greater than 50000
        .eq('payment_status', 'pending')
        .not('invoice_data_json', 'is', null)
        .limit(100);
        
    // Ensure invoice_data_json is not null
    if (!unpaidOrders || unpaidOrders.length === 0) {
        console.log('No unpaid orders found or invoice_data_json is null');
        return NextResponse.json({ message: 'No unpaid orders found' });
    }

    unpaidOrders.forEach(async (order, index) => {
        if (!order.invoice_data_json) {
            console.log(`Skipping order ${order.id} as invoice_data_json is null`);
            return;
        }

        const invoiceData = order.invoice_data_json;

        try {
            const { success, paid } = await getPaymentStatus(invoiceData.invoiceId);
            console.log(`${index}/${unpaidOrders.length} - ${invoiceData.invoiceId}:`, { success, paid });
            if (success) {
                if(paid) {
                    // Update order payment status to 'closed'
                    const { error } = await supabase.from('orders')
                        .update({ payment_status: 'closed' })
                        .eq('id', order.id);
                    if (error) {
                        console.error(`Error updating order ${order.id} to closed:`, error);
                    } else {
                        console.log(`Order ${order.id} marked as closed.`);
                    }
                }
                else {
                    console.log(`Invoice ${invoiceData.invoiceId} for order ${order.id} is still unpaid.`);
                }
            }
        } catch (error) {
            console.error(`Error checking payment status for invoice ${invoiceData.invoiceId}:`, error);
        }
    });
    return NextResponse.json({ message: 'Cron job executed successfully' });
}