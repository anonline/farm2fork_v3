import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { OrderProvider } from 'src/contexts/order-context';

import { OrderDetailsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Order details | Dashboard - ${CONFIG.appName}` };

type Props = {
    readonly params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;

    return (
        <OrderProvider>
            <OrderDetailsView orderId={id} />
        </OrderProvider>
    );
}
