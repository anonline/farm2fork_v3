
import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { fetchWpUsers, pingWoocommerce, fetchWooProducts, fetchWooProducers, fetchWooCategories } from 'src/actions/woocommerce-ssr';

import WoocommerceImportView from 'src/sections/dashboard/woocommerce/view/woocommerce-import-view';

export const metadata: Metadata = { title: `Woocommerce | Dashboard - ${CONFIG.appName}` };

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';

export default async function Page() {

    const status = await pingWoocommerce();

    const products = status ? await fetchWooProducts() : [];
    
    const categories = status ? await fetchWooCategories() : [];

    const producers = status ? await fetchWooProducers() : [];

    const wpUsers = await fetchWpUsers();

    return (
        <WoocommerceImportView 
            status={status} 
            products={products} 
            categories={categories} 
            producers={producers}
            wpUsers={wpUsers}
        />
    );
}