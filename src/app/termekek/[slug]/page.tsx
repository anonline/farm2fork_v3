import type { Metadata } from 'next';

import { createClient } from '@supabase/supabase-js';

import { CONFIG } from 'src/global-config';
import { ProductProvider } from 'src/contexts/product-context';

import ProductDetails from 'src/components/product-details/product-details';


// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Termék - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ slug: string }>;
};
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProductBySlug(slug: string) {
    const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('url', slug)
        .single();

    if (error) {
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
            // Not found, trigger 404
            // Next.js 13+ way to trigger 404 page
            // Import notFound from 'next/navigation'
            const { notFound } = await import('next/navigation');
            notFound();
        }
        throw error;
    }
    return data;
}
export default async function Page({ params }: Readonly<Props>) {
    const { slug } = await params;

    return (
        <ProductProvider slug={slug}>
            <ProductDetails />
        </ProductProvider>
    );
}