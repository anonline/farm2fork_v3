import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';

import { ShipmentDetailsView } from 'src/sections/shipments/view';

export const metadata: Metadata = { title: `Összesítő részletek | Dashboard - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ id: number }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { id } = await params;

    return (
        <ShipmentsProvider>
            <ShipmentDetailsView id={id} />
        </ShipmentsProvider>
    );
}
