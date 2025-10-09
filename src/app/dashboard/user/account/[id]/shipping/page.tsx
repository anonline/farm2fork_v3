import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AdminUserShippingView } from 'src/sections/account/view/admin-user-shipping-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Felhasználó szállítási címek | Dashboard - ${CONFIG.appName}`,
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ShippingPage({ params }: Props) {
    const { id } = await params;

    return <AdminUserShippingView userId={id} />;
}
