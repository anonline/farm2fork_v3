import type { Metadata } from 'next';
import { ProductsProvider } from 'src/contexts/products-context';

import { CONFIG } from 'src/global-config';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return (
        <ProductsProvider>
            <ProductListView />
        </ProductsProvider>
    );
}
