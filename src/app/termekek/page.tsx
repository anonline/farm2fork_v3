import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';
import { CategoryProvider } from 'src/contexts/category-context';

import ProductsPage from 'src/components/products-page/products-page';
import Container from 'node_modules/@mui/material/esm/Container/Container';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termékek - ${CONFIG.appName}` };

export default async function Page() {
    return (
        <Container sx={{ margin: '0 auto', padding: '20px' }}>
            <ProductsProvider>
                <CategoryProvider>
                    <ProductsPage urlSlug="" />
                </CategoryProvider>
            </ProductsProvider>
        </Container>
    );
}
