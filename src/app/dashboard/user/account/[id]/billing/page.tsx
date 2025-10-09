import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AdminUserBillingView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Felhasználó számlázás | Dashboard - ${CONFIG.appName}`,
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { id } = await params;

    return <AdminUserBillingView userId={id} />;
}
