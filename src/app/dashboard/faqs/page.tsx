import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { FaqListView } from 'src/sections/faqs/view/faqs-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `GYIK | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <FaqListView />;
}
