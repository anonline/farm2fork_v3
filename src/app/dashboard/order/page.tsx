import type { Metadata } from 'next';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';

import { CONFIG } from 'src/global-config';

import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Order list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <ShipmentsProvider><OrderListView /></ShipmentsProvider>;
}
