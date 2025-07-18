import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ProducerListView } from 'src/sections/producer/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termelők | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <ProducerListView />;
}
