import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import ProfilRendelesekView from 'src/sections/profil/profil-rendelesek/view/profil-rendelesek-view';

export const metadata: Metadata = { title: `Profil - ${CONFIG.appName}` };

export default function Page() {
    return (
        <ProfilRendelesekView/>    
    );
};