import type { Metadata } from 'next';
import type { IProductItem } from 'src/types/product';
import { CONFIG } from 'src/global-config';
import { supabase } from 'src/lib/supabase';
import { ProductDetailsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product details | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  
  const response = await supabase.from("Products").select("*").eq("id", id).single();
  const { data: product, error } = response;
  if (error) throw error.message;
  
  
  //const { product } = await getProduct(id);
  
  return <ProductDetailsView product={product} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * 1. Set `isStaticExport = true` in `next.config.{mjs|ts}`.
 * 2. This allows `generateStaticParams()` to pre-render dynamic routes at build time.
 *
 * For more details, see:
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 *
 * NOTE: Remove all "generateStaticParams()" functions if not using static exports.
 */
export async function generateStaticParams() {
  const res = await supabase.from("Products").select("*");
  const { data:products, error } = res;
  if (error) throw error.message;
  //const res = await axios.get(endpoints.product.list);
  const data: IProductItem[] = CONFIG.isStaticExport
    ? products
    : products.slice(0, 1);

  return data.map((product: IProductItem) => ({
    id: product.id.toString(),
  }));
}
