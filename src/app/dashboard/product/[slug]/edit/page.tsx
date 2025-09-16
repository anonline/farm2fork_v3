import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ProductProvider } from 'src/contexts/product-context';
import { CategoryProvider } from 'src/contexts/category-context';
import { ProducersProvider } from 'src/contexts/producers-context';
import { ProductCategoryConnectionProvider } from 'src/contexts/product-category-connection-context';

import { ProductEditView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termék szerkesztése | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { slug } = await params;
  return (
    <ProductProvider slug={slug}>
      <ProducersProvider showDisabled>
        <CategoryProvider>
          <ProductCategoryConnectionProvider>
            <ProductEditView />
          </ProductCategoryConnectionProvider>
        </CategoryProvider>
      </ProducersProvider>
    </ProductProvider>
  );
}
