
import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { fetchWpUsers, fetchWooOrders, pingWoocommerce, fetchWooProducts, fetchWooProducers, fetchWooCategories } from 'src/actions/woocommerce-ssr';

import WoocommerceImportView from 'src/sections/dashboard/woocommerce/view/woocommerce-import-view';

export const metadata: Metadata = { title: `Woocommerce | Dashboard - ${CONFIG.appName}` };

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';

export default async function Page() {

    let status = null;
    let products = [];
    let categories = [];
    let producers = [];
    let wpUsers = [];
    let orders = [];
    try {
        status = await pingWoocommerce();
    } catch (error) {
        console.error('Error pinging WooCommerce:', error);
    }
    try {
        products = status ? await fetchWooProducts() : [];
    } catch (error) {
        console.error('Error fetching WooCommerce products:', error);
    }
    try {
        categories = status ? await fetchWooCategories() : [];
    } catch (error) {
        console.error('Error fetching WooCommerce categories:', error);
    }
    try {
        producers = status ? await fetchWooProducers() : [];
    } catch (error) {
        console.error('Error fetching WooCommerce producers:', error);
    }
    try {
        wpUsers = await fetchWpUsers();
    } catch (error) {
        console.error('Error fetching WP users:', error);
    }
    try {
        orders = await fetchWooOrders();
    } catch (error) {
        console.error('Error fetching WooCommerce orders:', error);
    }

    return (
        <WoocommerceImportView
            status={status}
            products={products}
            categories={categories}
            producers={producers}
            wpUsers={wpUsers}
            orders={orders}
        />
    );
}