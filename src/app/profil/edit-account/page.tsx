import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import ProfilEditAccountView from 'src/sections/profil/profil-edit-account/view/profil-edit-account-view';


export const metadata: Metadata = { title: `Profil - ${CONFIG.appName}` };
export default function Page() {
    return (
        <ProfilEditAccountView/>    
    );
};