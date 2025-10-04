import type { Metadata } from 'next';
import { CategoryProvider } from 'src/contexts/category-context';
import { ProducersProvider } from 'src/contexts/producers-context';
import { ProductCategoryConnectionProvider } from 'src/contexts/product-category-connection-context';

import { CONFIG } from 'src/global-config';

import { ProductCreateView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: `Új termék létrehozása | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
    return (<ProducersProvider showDisabled>
        <CategoryProvider>
            <ProductCategoryConnectionProvider>
                <ProductCreateView />
            </ProductCategoryConnectionProvider>
        </CategoryProvider>
    </ProducersProvider>);
}
