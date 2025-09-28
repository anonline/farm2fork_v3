import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { EmailTemplatesListView } from 'src/sections/email-templates/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Email sablonok | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <EmailTemplatesListView />;
}
