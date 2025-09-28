import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { EmailTemplateCreateView } from 'src/sections/email-templates/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Új Email sablon | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <EmailTemplateCreateView />;
}
