import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';
import { CategoryProvider } from 'src/contexts/category-context';

import ProductsPage from 'src/components/products-page/products-page';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termékek - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ slug?: string }>;
};
export default async function Page({ params }: Readonly<Props>) {
    const { slug } = await params;
    return (
        <ProductsProvider>
            <CategoryProvider>
                <ProductsPage urlSlug={decodeURIComponent(slug?.[0] ?? '')} />
            </CategoryProvider>
        </ProductsProvider>
    );
}
