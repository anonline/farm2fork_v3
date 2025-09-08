
import { fetchWooCategories, fetchWooProducers, fetchWooProducts, pingWoocommerce } from 'src/actions/woocommerce-ssr';
import WoocommerceImportView from 'src/sections/dashboard/woocommerce/view/woocommerce-import-view';


export default async function WooImportPage() {

    const status = await pingWoocommerce();

    const products = status ? await fetchWooProducts() : [];
    
    const categories = status ? await fetchWooCategories() : [];

    const producers = status ? await fetchWooProducers() : [];
    
    return (
        <WoocommerceImportView status={status} products={products} categories={categories} producers={producers} />
    );
}