import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import AszfView from 'src/sections/aszf/aszf-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `GYIK - ${CONFIG.appName}` };

export default async function Page() {
    return <AszfView />;
}
