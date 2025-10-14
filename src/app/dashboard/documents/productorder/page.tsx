import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { CategoryProvider } from 'src/contexts/category-context';

import { CategoryOrderView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Kategória Sorrend | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return (
        <CategoryProvider>
            <CategoryOrderView />
        </CategoryProvider>
    );
}
