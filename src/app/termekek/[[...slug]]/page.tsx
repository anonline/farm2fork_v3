import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';

import ProductsPage from 'src/components/products-page/products-page';
import { CategoryProvider } from 'src/contexts/category-context';

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
                <ProductsPage urlSlug={slug?.[0] ?? undefined} />
            </CategoryProvider>
        </ProductsProvider>);
}
