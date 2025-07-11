import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CategoryListView } from 'src/sections/category/view/category-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termék kategóriák | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <CategoryListView />;
}
