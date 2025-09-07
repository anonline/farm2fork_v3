import type { Metadata } from 'next';

import { transformOrderDataToTableItem } from 'src/utils/transform-order-data';

import { CONFIG } from 'src/global-config';
import { getOrderByIdSSR } from 'src/actions/order-ssr';

import { OrderDetailsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Order details | Dashboard - ${CONFIG.appName}` };

type Props = {
    readonly params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;

    const { order: orderData, error } = await getOrderByIdSSR(id);
    
    // Transform the order data to match the expected format
    const currentOrder = orderData ? await transformOrderDataToTableItem(orderData) : undefined;

    if (error) {
        // Handle error case - could redirect to error page or show error message
        console.error('Error fetching order:', error);
    }

    return <OrderDetailsView order={currentOrder} orderData={orderData || undefined} orderError={error} />;
}
