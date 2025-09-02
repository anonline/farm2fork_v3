import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductProvider } from 'src/contexts/product-context';

import ProductDetails from 'src/components/product-details/product-details';

// ----------------------------------------------------------------------
export const metadata: Metadata = { title: `Termék - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ slug: string }>;
};
export default async function Page({ params }: Readonly<Props>) {
    const { slug } = await params;

    return (
        <ProductProvider slug={slug}>
            <ProductDetails />
        </ProductProvider>
    );
}
