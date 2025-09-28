import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Új Email sablon | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <EmailTemplateEditNewView />;
}
