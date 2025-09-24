import Woocommerce from 'src/lib/woocommerce';

const debug = true;

const log = (message: string, ...optionalParams: any[]) => {
    if (debug) {
        console.log(message, ...optionalParams);
    }
};

// Ping WooCommerce to check if the connection is successful
export async function pingWoocommerce() {
    const response = await Woocommerce.get('system_status');
    log('WooCommerce System Status:', response.data.environment.wp_version);
    return response.data;
}

export async function fetchWooProducts() {
    let allProducts: any[] = [];
    let page = 1;

    do {
        const response = await Woocommerce.get('products', {
            per_page: 100,
            page,
        });
        allProducts = allProducts.concat(response.data);

        log(`Fetched ${response.data.length} products, total so far: ${allProducts.length}`);

        if (response.data.length < 100) break; // No more products to fetch
        page++;
    } while (page < 100);

    log(`Total products fetched: ${allProducts.length}`);
    console.log('allProducts', JSON.stringify(allProducts[0])); // Log first 500 chars of products for inspection
    return allProducts;
}

export async function fetchWooCategories() {
    let allCategories: any[] = [];
    let page = 1;

    do {
        const response = await Woocommerce.get('products/categories', {
            per_page: 100,
            page,
        });
        allCategories = allCategories.concat(response.data);

        log(`Fetched ${response.data.length} categories, total so far: ${allCategories.length}`);

        if (response.data.length < 100) break; // No more categories to fetch
        page++;
    } while (page < 100);

    log(`Total categories fetched: ${allCategories.length}`);
    return allCategories;
}

export async function fetchWooProducers() {
    const response = await Woocommerce.get('producers');
    log(`Fetched ${response.data.length} producers`);
    return response.data;
}
