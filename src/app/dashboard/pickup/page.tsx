import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PickupLocationListView } from 'src/sections/pickup-location';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Átvételi Pontok | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <PickupLocationListView />;
}
