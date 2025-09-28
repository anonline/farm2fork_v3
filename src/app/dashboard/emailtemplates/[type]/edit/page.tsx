import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Email sablon szerkesztése | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <EmailTemplateEditNewView />;
}
