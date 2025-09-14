import type { Metadata } from 'next';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';
import { ShipmentsListView } from 'src/sections/shipments/view';

export const metadata: Metadata = { title: 'Szállítási összesítők' };

export default function Page() {
    return (
        <ShipmentsProvider>
            <ShipmentsListView />
        </ShipmentsProvider>
    );
}
