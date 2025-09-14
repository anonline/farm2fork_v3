import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CheckoutView } from 'src/sections/checkout/view';

import { UserAuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Rendelés - ${CONFIG.appName}` };

export default function Page() {
    return (
        <UserAuthGuard>
            <CheckoutView />
        </UserAuthGuard>
    );
}
