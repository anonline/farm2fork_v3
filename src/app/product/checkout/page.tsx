import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserAuthGuard } from 'src/auth/guard';
import { CheckoutView } from 'src/sections/checkout/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Checkout - ${CONFIG.appName}` };

export default function Page() {
    return (
        <UserAuthGuard>
            <CheckoutView />
        </UserAuthGuard>
    );
}
