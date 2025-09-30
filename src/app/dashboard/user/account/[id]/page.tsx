import type { Metadata } from 'next';
import { getUser } from 'src/actions/user-management';

import { CONFIG } from 'src/global-config';

import { AccountGeneralView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Felhasználói fiók | Dashboard - ${CONFIG.appName}`,
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { id } = await params;
        const currentUser = await getUser(id);

    return <AccountGeneralView user={currentUser} />;
}
