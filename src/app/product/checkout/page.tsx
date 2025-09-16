import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ShipmentsProvider } from 'src/contexts/shipments/shipments-provider';

import { CheckoutView } from 'src/sections/checkout/view';

import { UserAuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Rendelés - ${CONFIG.appName}` };

export default function Page() {
    return (
        <UserAuthGuard>
            <ShipmentsProvider>
                <CheckoutView />
            </ShipmentsProvider>
        </UserAuthGuard>
    );
}
