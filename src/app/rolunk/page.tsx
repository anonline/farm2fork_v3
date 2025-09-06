import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ArticlesProvider } from 'src/contexts/articles-context';

import RolunkView from 'src/sections/rolunk/view/rolunk-view';

export const metadata: Metadata = { title: `Rólunk - ${CONFIG.appName}` };
export default function Page() {
    return (
        <ArticlesProvider>
            <RolunkView />
        </ArticlesProvider>
    );
}
