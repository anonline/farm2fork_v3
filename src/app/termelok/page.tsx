import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProducersProvider } from 'src/contexts/producers-context';

import ProducersPage from 'src/components/producers-page/producers-page';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termelők - ${CONFIG.appName}` };

export default async function Page() {
    return (
    <ProducersProvider>
        <ProducersPage />
    </ProducersProvider>);
}
