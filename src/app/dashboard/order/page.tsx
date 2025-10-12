import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';

import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Order list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <ShipmentsProvider limit={10}><OrderListView /></ShipmentsProvider>;
}
