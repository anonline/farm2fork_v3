import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';
import { CategoryProvider } from 'src/contexts/category-context';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
    return (
        <ProductsProvider>
            <CategoryProvider>
                <ProductListView />
            </CategoryProvider>
        </ProductsProvider>
    );
}
