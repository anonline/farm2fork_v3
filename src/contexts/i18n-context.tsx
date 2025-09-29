'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  translateProduct,
  translateProducer,
  translateCategory,
} from 'src/utils/translate-db';
import type { Product, Producer, Category } from 'src/types/database.types';

type Locale = 'hu' | 'en' | 'de';

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  translateProduct: (product: Product) => Product;
  translateProducer: (producer: Producer) => Producer;
  translateCategory: (category: Category) => Category;
  changeLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = 'hu' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from localStorage or browser settings
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        // Try to get saved locale from localStorage
        const savedLocale = typeof window !== 'undefined' 
          ? localStorage.getItem('farm2fork_locale') as Locale 
          : null;
        
        // Get browser locale as fallback
        const browserLocale = typeof window !== 'undefined' 
          ? (navigator.language.split('-')[0] as Locale) 
          : 'hu';
        
        const supportedLocales: Locale[] = ['hu', 'en', 'de'];
        
        // Determine which locale to use
        const targetLocale = savedLocale || 
          (supportedLocales.includes(browserLocale) ? browserLocale : 'hu');
        
        await changeLocale(targetLocale);
      } catch (error) {
        console.error('Error initializing locale:', error);
        // Fallback to Hungarian if initialization fails
        await changeLocale('hu');
      }
    };

    initializeLocale();
  }, []);

  /**
   * Get translation for a key with dot notation support
   */
  const t = (key: string): string => {
    if (!translations || Object.keys(translations).length === 0) {
      return key;
    }

    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  /**
   * Change locale and load corresponding translations
   */
  const changeLocale = async (newLocale: Locale) => {
    setIsLoading(true);
    
    try {
      // Dynamic import of locale file
      const response = await import(`../locales/${newLocale}.json`);
      setTranslations(response.default);
      setLocale(newLocale);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('farm2fork_locale', newLocale);
      }
      
      // Update HTML lang attribute for SEO
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
      
    } catch (error) {
      console.error(`Failed to load translations for locale: ${newLocale}`, error);
      
      // If loading fails and it's not Hungarian, try Hungarian as fallback
      if (newLocale !== 'hu') {
        try {
          const fallbackResponse = await import('../locales/hu.json');
          setTranslations(fallbackResponse.default);
          setLocale('hu');
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('farm2fork_locale', 'hu');
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback Hungarian translations:', fallbackError);
          // Set empty translations as last resort
          setTranslations({});
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create translation functions bound to current locale
  const translateProductWithLocale = (product: Product) => 
    translateProduct(product, locale);
  
  const translateProducerWithLocale = (producer: Producer) => 
    translateProducer(producer, locale);
    
  const translateCategoryWithLocale = (category: Category) => 
    translateCategory(category, locale);

  const contextValue: I18nContextType = {
    locale,
    t,
    translateProduct: translateProductWithLocale,
    translateProducer: translateProducerWithLocale,
    translateCategory: translateCategoryWithLocale,
    changeLocale,
    isLoading,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use i18n context
 */
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

/**
 * Hook to get current locale only (for server components that need locale info)
 */
export const useLocale = (): Locale => {
  const { locale } = useI18n();
  return locale;
};

/**
 * Helper function to get supported locales
 */
export const getSupportedLocales = (): Locale[] => {
  return ['hu', 'en', 'de'];
};

/**
 * Helper function to validate locale
 */
export const isValidLocale = (locale: string): locale is Locale => {
  return getSupportedLocales().includes(locale as Locale);
};