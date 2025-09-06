import type { Metadata } from 'next';

import { createClient } from '@supabase/supabase-js';

import { CONFIG } from 'src/global-config';
import { ProductsProvider } from 'src/contexts/products-context';
import { ProducersProvider } from 'src/contexts/producers-context';

import TermelokView from 'src/sections/termelok/view/termelok-view';

// ----------------------------------------------------------------------

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: producer } = await supabase
            .from('Producers')
            .select('name')
            .eq('slug', slug)
            .single();

        return {
            title: producer?.name
                ? `${producer.name} - ${CONFIG.appName}`
                : `A termelő nem található - ${CONFIG.appName}`,
        };
    } catch (ex) {
        console.error('Hiba a metaadatok generálása közben:', ex);
        return {
            title: `Termelők - ${CONFIG.appName}`,
        };
    }
}

export default async function Page({ params }: Readonly<Props>) {
    const { slug } = await params;

    return (
        <ProductsProvider>
            <ProducersProvider>
                <TermelokView viewslug={slug} />
            </ProducersProvider>
        </ProductsProvider>
    );
}
