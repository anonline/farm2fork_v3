import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AboutUsListView } from 'src/sections/dashboard/settings/aboutus/aboutus-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Rólunk - Beállítások | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
    return <AboutUsListView />;
}
