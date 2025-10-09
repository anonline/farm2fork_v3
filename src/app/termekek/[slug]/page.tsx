import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

import { Container } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { ProductProvider } from 'src/contexts/product-context';
import { CategoryProvider } from 'src/contexts/category-context';
import { ProductsProvider } from 'src/contexts/products-context';

import ProductsPage from 'src/components/products-page/products-page';
import ProductDetails from 'src/components/product-details/product-details';

// ----------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Check if it's a category
    const { data: category } = await supabase
        .from('ProductCategories')
        .select('name')
        .eq('slug', decodedSlug)
        .maybeSingle();

    if (category) {
        return { title: `${category.name} - ${CONFIG.appName}` };
    }

    // Check if it's a product
    const { data: product } = await supabase
        .from('Products')
        .select('name')
        .eq('url', decodedSlug)
        .maybeSingle();

    if (product) {
        return { title: `${product.name} - ${CONFIG.appName}` };
    }

    return { title: `Termék - ${CONFIG.appName}` };
}

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // First, check if it's a category
    const { data: category } = await supabase
        .from('ProductCategories')
        .select('slug')
        .eq('slug', decodedSlug)
        .maybeSingle();

    if (category) {
        // It's a category - render products page with category filter
        return (
             <Container sx={{ margin: '0 auto', padding: '20px' }}>
                <ProductsProvider>
                    <CategoryProvider>
                        <ProductsPage urlSlug={decodedSlug} />
                    </CategoryProvider>
                </ProductsProvider>
            </Container>
        );
    }

    // If not a category, check if it's a product
    const { data: product } = await supabase
        .from('Products')
        .select('id')
        .eq('url', decodedSlug)
        .maybeSingle();

    if (product) {
        // It's a product - render product details
        return (
            <Container maxWidth={false} sx={{ margin: '0 auto', padding: '0px !important' }}>
                <ProductProvider slug={decodedSlug}>
                    <ProductDetails />
                </ProductProvider>
            </Container>
        );
    }

    // Neither category nor product found
    notFound();
}
