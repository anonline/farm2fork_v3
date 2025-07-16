import type { Metadata } from 'next';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';
import { ProducersProvider } from 'src/contexts/producers-context'; 

import TermelokView from 'src/sections/termelok/view/termelok-view';

// ----------------------------------------------------------------------

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;

  try {
    const producer = await fetch(paths.api.search.producers + '?q=' + slug).then((res) => res.json());

    return {
      title: producer?.title ? `${producer.title} - ${CONFIG.appName}` : `A termelő nem található - ${CONFIG.appName}`,
    };
  } catch (error) {
    console.error("Hiba a metaadatok generálása közben:", error);
    return {
      title: `Termelők - ${CONFIG.appName}`,
    };
  }
}

export default function Page({ params }: Props) {
  const slug = params.slug;

  return (
    <ProductsProvider>
      <ProducersProvider>
        <TermelokView viewslug={slug} />
      </ProducersProvider>
    </ProductsProvider>
  );
}
