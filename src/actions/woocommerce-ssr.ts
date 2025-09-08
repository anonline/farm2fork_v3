import Woocommerce from "src/lib/woocommerce";

const debug = true;

const log = (message: string, ...optionalParams: any[]) => {
    if (debug) {
        console.log(message, ...optionalParams);
    }
};

// Cache interface for type safety
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry<any>>();

// Cache TTL configurations (in milliseconds)
const CACHE_DURATIONS = {
    SYSTEM_STATUS: 5 * 60 * 1000,    // 5 minutes
    PRODUCTS: 10 * 60 * 1000,        // 10 minutes
    CATEGORIES: 30 * 60 * 1000,      // 30 minutes
    PRODUCERS: 15 * 60 * 1000,       // 15 minutes
} as const;

// Generic memoization function similar to useMemo
function useMemoCache<T>(
    key: string,
    asyncFn: () => Promise<T>,
    ttl: number
): Promise<T> {
    return new Promise(async (resolve, reject) => {
        try {
            const now = Date.now();
            const cached = cache.get(key);
            
            // Check if cache exists and is still valid
            if (cached && (now - cached.timestamp) < cached.ttl) {
                log(`Cache HIT for ${key} - using cached data`);
                resolve(cached.data);
                return;
            }
            
            log(`Cache MISS for ${key} - fetching fresh data`);
            
            // Fetch fresh data
            const freshData = await asyncFn();
            
            // Store in cache
            cache.set(key, {
                data: freshData,
                timestamp: now,
                ttl: ttl
            });
            
            log(`Cache STORED for ${key} - data cached for ${ttl / 1000}s`);
            resolve(freshData);
            
        } catch (error) {
            log(`Cache ERROR for ${key}:`, error);
            reject(error);
        }
    });
}

// Cache invalidation utility
export function invalidateCache(key?: string) {
    if (key) {
        cache.delete(key);
        log(`Cache INVALIDATED for ${key}`);
    } else {
        cache.clear();
        log('Cache CLEARED - all entries removed');
    }
}

// Get cache statistics
export function getCacheStats() {
    const stats = {
        totalEntries: cache.size,
        entries: Array.from(cache.entries()).map(([key, entry]) => ({
            key,
            age: Date.now() - entry.timestamp,
            ttl: entry.ttl,
            isExpired: (Date.now() - entry.timestamp) > entry.ttl
        }))
    };
    log('Cache Stats:', stats);
    return stats;
}

// Ping WooCommerce to check if the connection is successful
export async function pingWoocommerce() {
    return useMemoCache(
        'woo-system-status',
        async () => {
            const response = await Woocommerce.get("system_status");
            log('WooCommerce System Status:', response.data.environment.wp_version);
            return response.data;
        },
        CACHE_DURATIONS.SYSTEM_STATUS
    );
}

export async function fetchWooProducts() {
    return useMemoCache(
        'woo-products',
        async () => {
            let allProducts: any[] = [];
            let page = 1;
            
            do {
                const response = await Woocommerce.get("products", { 
                    per_page: 100, 
                    page: page 
                });
                allProducts = allProducts.concat(response.data);
                
                log(`Fetched ${response.data.length} products, total so far: ${allProducts.length}`);
                
                if (response.data.length < 100) break; // No more products to fetch
                page++;
            } while (true);
            
            log(`Total products fetched: ${allProducts.length}`);
            return allProducts;
        },
        CACHE_DURATIONS.PRODUCTS
    );
}

export async function fetchWooCategories() {
    return useMemoCache(
        'woo-categories',
        async () => {
            let allCategories: any[] = [];
            let page = 1;
            
            do {
                const response = await Woocommerce.get("products/categories", { 
                    per_page: 100, 
                    page: page 
                });
                allCategories = allCategories.concat(response.data);
                
                log(`Fetched ${response.data.length} categories, total so far: ${allCategories.length}`);
                
                if (response.data.length < 100) break; // No more categories to fetch
                page++;
            } while (true);
            
            log(`Total categories fetched: ${allCategories.length}`);
            return allCategories;
        },
        CACHE_DURATIONS.CATEGORIES
    );
}

export async function fetchWooProducers() {
    return useMemoCache(
        'woo-producers',
        async () => {
            const response = await Woocommerce.get("producers");
            log(`Fetched ${response.data.length} producers`);
            return response.data;
        },
        CACHE_DURATIONS.PRODUCERS
    );
}

// Convenience functions for cache management
export const WooCache = {
    // Invalidate specific data types
    invalidateProducts: () => invalidateCache('woo-products'),
    invalidateCategories: () => invalidateCache('woo-categories'),
    invalidateProducers: () => invalidateCache('woo-producers'),
    invalidateSystemStatus: () => invalidateCache('woo-system-status'),
    
    // Invalidate all WooCommerce data
    invalidateAll: () => invalidateCache(),
    
    // Check what's in cache
    getStats: getCacheStats,
    
    // Preload data (useful for warming up cache)
    async preloadAll() {
        log('Preloading all WooCommerce data...');
        try {
            await Promise.all([
                fetchWooProducts(),
                fetchWooCategories(),
                fetchWooProducers(),
                pingWoocommerce()
            ]);
            log('Preload completed successfully');
        } catch (error) {
            log('Preload failed:', error);
            throw error;
        }
    },
    
    // Force refresh (invalidate and fetch fresh)
    async refreshProducts() {
        this.invalidateProducts();
        return fetchWooProducts();
    },
    
    async refreshCategories() {
        this.invalidateCategories();
        return fetchWooCategories();
    },
    
    async refreshProducers() {
        this.invalidateProducers();
        return fetchWooProducers();
    }
};
  