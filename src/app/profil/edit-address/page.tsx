import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import ProfilEditAddressView from 'src/sections/profil/profil-edit-address/view/profil-edit-address-view';

export const metadata: Metadata = { title: `Profil - ${CONFIG.appName}` };

export default function Page() {
    return <ProfilEditAddressView />;
}
