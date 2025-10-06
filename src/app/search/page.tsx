import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import SearchPage from 'src/components/search/search-page';
import { ProductsProvider } from 'src/contexts/products-context';

export const metadata: Metadata = { title: `Keresés - ${CONFIG.appName}` };

export default function Page() {
    return <ProductsProvider><SearchPage /></ProductsProvider>;
}
