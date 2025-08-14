import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ProductCreateView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Új termék létrehozása | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return <ProductCreateView />;
}