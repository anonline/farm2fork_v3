import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';

import ProductsPage from 'src/components/products-page/products-page';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termékek - ${CONFIG.appName}` };

export default async function Page() {
    return (
    <ProductsProvider>
        <ProductsPage />
    </ProductsProvider>);
}
