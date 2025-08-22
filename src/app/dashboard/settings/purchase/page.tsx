import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { PurchaseListView } from 'src/sections/dashboard/settings/purchase/purchase-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Vásárlási beállítások | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <PurchaseListView />;
}
