import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AdminUserOrdersView } from 'src/sections/account/view/admin-user-orders-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Felhasználó rendelések | Dashboard - ${CONFIG.appName}`,
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function OrdersPage({ params }: Props) {
    const { id } = await params;

    return <AdminUserOrdersView userId={id} />;
}
