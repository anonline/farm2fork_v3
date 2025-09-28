import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MailView } from 'src/sections/mail/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Email sablonok | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <EmailTemplatesView />;
}
