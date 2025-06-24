import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import RolunkView from 'src/sections/rolunk/view/rolunk-view';


export const metadata: Metadata = { title: `Rolunk - ${CONFIG.appName}` };
export default function Page() {
    return <RolunkView />;
}