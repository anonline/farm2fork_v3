import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { OrderProvider } from 'src/contexts/order-context';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';

import { OrderCreateView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create order | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return (
        <ShipmentsProvider limit={10}>
            <OrderProvider>
                <OrderCreateView />
            </OrderProvider>
        </ShipmentsProvider>
    );
}
