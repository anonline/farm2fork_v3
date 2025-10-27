
import type { BackendModule, ReadCallback } from 'i18next';
import { supabase } from 'src/lib/supabase';

/**
 * Translation cache interface
 */
interface TranslationCache {
    [language: string]: {
        [namespace: string]: {
            data: any;
            timestamp: number;
        };
    };
}

/**
 * Translation fetcher callback type
 */
type TranslationFetcher = (language: string, namespace: string) => Promise<any>;

/**
 * Default translation fetcher using server action
 */
const defaultFetcher: TranslationFetcher = async (language: string, namespace: string) => {
    const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', language)
        .eq('namespace', namespace);

    if (error) {
        console.error('Error fetching translations:', error);
        throw error;
    }
    console.log('Fetched translations from DB:', data);
    const result: { [key: string]: string } = {};
    for (const item of data) {
        result[item.key] = item.value;
    }
    return result;
};

export class DatabaseBackend implements BackendModule<object> {
    static readonly type = 'backend' as const;
    type = 'backend' as const;

    private cache: TranslationCache = {};
    private readonly cacheDuration = 1000 * 10;//60 * 60; // 1 óra cache
    private readonly fetcher: TranslationFetcher;

    constructor(
        services?: any,
        backendOptions?: any,
        i18nextOptions?: any,
        fetcher?: TranslationFetcher
    ) {
        this.fetcher = fetcher || defaultFetcher;
        this.init(services, backendOptions, i18nextOptions);
    }

    init(services?: any, backendOptions?: any, i18nextOptions?: any): void {
        // Inicializálás ha szükséges
        //console.log('DatabaseBackend initialized');
    }

    /**
     * Fordítások betöltése adatbázisból cache-szel
     */
    read(language: string, namespace: string, callback: ReadCallback): void {
        const now = Date.now();
        const cached = this.cache[language]?.[namespace];
        console.log('Reading translations for:', language, namespace);
        // Cache ellenőrzés
        if (cached && now - cached.timestamp < this.cacheDuration) {
            callback(null, cached.data);
            console.log('Returned translations from cache:', language, namespace);
            return;
        }

        // Betöltés DB-ből
        this.loadFromDatabase(language, namespace)
            .then((data) => {
                // Cache frissítés
                if (!this.cache[language]) {
                    this.cache[language] = {};
                }
                this.cache[language][namespace] = {
                    data,
                    timestamp: now,
                };

                callback(null, data);
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    /**
     * Fordítások betöltése API-ból
     */
    private async loadFromDatabase(
        language: string,
        namespace: string
    ): Promise<any> {
        try {
            // Use the injected fetcher
            const translations = await this.fetcher(language, namespace);
            return translations || {};
        } catch (error) {
            console.error(
                `Failed to load translations for ${language}/${namespace}:`,
                error
            );
            // Fallback üres objektumra hiba esetén
            return {};
        }
    }

    /**
     * Cache törlése (opcionális, hasznos lehet frissítésekhez)
     */
    clearCache(language?: string, namespace?: string): void {
        if (language && namespace) {
            if (this.cache[language]?.[namespace]) {
                delete this.cache[language][namespace];
            }
        } else if (language) {
            delete this.cache[language];
        } else {
            this.cache = {};
        }
    }

    /**
     * Cache előmelegítés (opcionális, hasznos lehet kezdeti betöltéshez)
     */
    async preloadCache(languages: string[], namespaces: string[]): Promise<void> {
        const promises = languages.flatMap((lng) =>
            namespaces.map((ns) =>
                this.loadFromDatabase(lng, ns).then((data) => {
                    if (!this.cache[lng]) {
                        this.cache[lng] = {};
                    }
                    this.cache[lng][ns] = {
                        data,
                        timestamp: Date.now(),
                    };
                })
            )
        );

        await Promise.all(promises);
    }
}

export const databaseBackend = new DatabaseBackend();