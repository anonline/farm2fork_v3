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

export async function fetchWpUsers() {
    const { cookies } = await import('next/headers');
    const { supabaseSSR } = await import('src/lib/supabase-ssr');
    
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    
    const { data, error } = await client.from('wp_users').select('*');
    
    if (error) {
        console.error('Error fetching wp_users:', error);
        return [];
    }
    
    log(`Fetched ${data?.length || 0} wp_users (${data?.filter(u => u.closed).length || 0} inited, ${data?.filter(u => !u.closed).length || 0} need init)`);
    return data || [];
}

export async function fetchWooOrders() {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {

        const ordersDir = path.join(process.cwd(), 'public/orders');
        console.log('Orders directory path:', ordersDir);
        // Check if orders directory exists
        try {
            await fs.access(ordersDir);
        } catch {
            log('Orders directory does not exist');
            return [];
        }
        
        // Read all files from orders directory
        const files = await fs.readdir(ordersDir);
        
        // Filter only .json files and extract order IDs
        const orderFiles = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const orderId = parseInt(file.replace('.json', ''), 10);
                return { file, orderId };
            })
            .filter(item => !isNaN(item.orderId))
            .sort((a, b) => b.orderId - a.orderId); // Sort in descending order
        
        // Read all order files
        const orders = await Promise.all(
            orderFiles.map(async ({ file, orderId }) => {
                try {
                    const filePath = path.join(ordersDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const orderData = JSON.parse(content);
                    return orderData;
                } catch (error) {
                    console.error(`Error reading order file ${file}:`, error);
                    return null;
                }
            })
        );
        
        // Filter out null values (failed reads)
        const validOrders = orders.filter(order => order !== null);
        
        log(`Fetched ${validOrders.length} orders from /orders directory`);
        return validOrders;
    } catch (error) {
        console.error('Error fetching woo orders:', error);
        return [];
    }
}
