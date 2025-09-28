import type { 
  Locale, 
  Product, 
  Producer, 
  Category, 
  Translation 
} from 'src/types/database.types';

/**
 * Get translated value for a specific field
 * Falls back to Hungarian, then to the original value
 */
export function getTranslation(
  translations: Translation[] | undefined,
  fieldName: string,
  locale: Locale,
  fallbackValue: string
): string {
  if (!translations || translations.length === 0) {
    return fallbackValue;
  }
  
  // First try the requested locale
  const translation = translations.find(
    t => t.field_name === fieldName && t.locale === locale
  );
  
  if (translation && translation.value.trim()) {
    return translation.value;
  }
  
  // Fallback to Hungarian if not the same as requested locale
  if (locale !== 'hu') {
    const hungarianTranslation = translations.find(
      t => t.field_name === fieldName && t.locale === 'hu'
    );
    
    if (hungarianTranslation && hungarianTranslation.value.trim()) {
      return hungarianTranslation.value;
    }
  }
  
  // Return original value as final fallback
  return fallbackValue;
}

/**
 * Translate a product record based on locale
 */
export function translateProduct(product: Product, locale: Locale): Product {
  if (!product.translations) {
    return product;
  }
  
  return {
    ...product,
    name: getTranslation(product.translations, 'name', locale, product.name),
    description: getTranslation(
      product.translations, 
      'description', 
      locale, 
      product.description || ''
    ),
    shortDescription: getTranslation(
      product.translations,
      'shortDescription', 
      locale,
      product.shortDescription || ''
    )
  };
}

/**
 * Translate a producer record based on locale
 */
export function translateProducer(producer: Producer, locale: Locale): Producer {
  if (!producer.translations) {
    return producer;
  }
  
  return {
    ...producer,
    name: getTranslation(producer.translations, 'name', locale, producer.name),
    description: getTranslation(
      producer.translations,
      'description',
      locale,
      producer.description || ''
    ),
    short_description: getTranslation(
      producer.translations,
      'short_description',
      locale,
      producer.short_description || ''
    ),
    bio_description: getTranslation(
      producer.translations,
      'bio_description',
      locale,
      producer.bio_description || ''
    )
  };
}

/**
 * Translate a category record based on locale  
 */
export function translateCategory(category: Category, locale: Locale): Category {
  if (!category.translations) {
    return category;
  }
  
  return {
    ...category,
    name: getTranslation(category.translations, 'name', locale, category.name),
    description: getTranslation(
      category.translations,
      'description',
      locale,
      category.description || ''
    )
  };
}

/**
 * Translate an array of products
 */
export function translateProducts(products: Product[], locale: Locale): Product[] {
  return products.map(product => translateProduct(product, locale));
}

/**
 * Translate an array of producers  
 */
export function translateProducers(producers: Producer[], locale: Locale): Producer[] {
  return producers.map(producer => translateProducer(producer, locale));
}

/**
 * Translate an array of categories
 */
export function translateCategories(categories: Category[], locale: Locale): Category[] {
  return categories.map(category => translateCategory(category, locale));
}

/**
 * Get all translations for a specific record
 */
export function getRecordTranslations(
  translations: Translation[] | undefined,
  fieldNames: string[]
): Record<string, Record<Locale, string>> {
  const result: Record<string, Record<Locale, string>> = {};
  
  fieldNames.forEach(fieldName => {
    result[fieldName] = { hu: '', en: '', de: '' };
  });
  
  if (!translations) {
    return result;
  }
  
  translations.forEach(translation => {
    if (result[translation.field_name]) {
      result[translation.field_name][translation.locale] = translation.value;
    }
  });
  
  return result;
}

/**
 * Check if a record has any translations
 */
export function hasTranslations(record: { translations?: Translation[] }): boolean {
  return !!(record.translations && record.translations.length > 0);
}

/**
 * Get available locales for a record
 */
export function getAvailableLocales(translations: Translation[] | undefined): Locale[] {
  if (!translations) {
    return ['hu'];
  }
  
  const locales = new Set<Locale>(['hu']);
  translations.forEach(t => locales.add(t.locale));
  
  return Array.from(locales).sort();
}

/**
 * Check if translation exists for specific field and locale
 */
export function hasTranslation(
  translations: Translation[] | undefined,
  fieldName: string,
  locale: Locale
): boolean {
  if (!translations) {
    return false;
  }
  
  return translations.some(
    t => t.field_name === fieldName && 
         t.locale === locale && 
         t.value.trim() !== ''
  );
}