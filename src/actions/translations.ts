'use server';

import type { 
  Locale, 
  Product, 
  Producer, 
  Category,
  Translation,
  TranslationCreate 
} from 'src/types/database.types';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';



// =============================================================================
// TRANSLATION MANAGEMENT ACTIONS
// =============================================================================

/**
 * Get all translations for a specific record
 */
export async function getTranslationsForRecord(
  tableName: string,
  recordId: string
): Promise<Translation[]> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('field_name', { ascending: true })
      .order('locale', { ascending: true });

    if (error) {
      console.error('Error fetching translations:', error);
      throw new Error(`Failed to fetch translations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTranslationsForRecord:', error);
    return [];
  }
}

/**
 * Save or update a translation
 */
export async function saveTranslation(
  tableName: string,
  recordId: string,
  fieldName: string,
  locale: Locale,
  value: string
): Promise<void> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { error } = await supabase
      .from('translations')
      .upsert(
        {
          table_name: tableName,
          record_id: recordId,
          field_name: fieldName,
          locale,
          value: value.trim(),
        },
        {
          onConflict: 'table_name,record_id,field_name,locale',
        }
      );

    if (error) {
      console.error('Error saving translation:', error);
      throw new Error(`Failed to save translation: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in saveTranslation:', error);
    throw error;
  }
}

/**
 * Delete a translation
 */
export async function deleteTranslation(
  tableName: string,
  recordId: string,
  fieldName: string,
  locale: Locale
): Promise<void> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .eq('field_name', fieldName)
      .eq('locale', locale);

    if (error) {
      console.error('Error deleting translation:', error);
      throw new Error(`Failed to delete translation: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteTranslation:', error);
    throw error;
  }
}

/**
 * Batch save multiple translations
 */
export async function saveTranslationsBatch(
  translations: TranslationCreate[]
): Promise<void> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { error } = await supabase
      .from('translations')
      .upsert(translations, {
        onConflict: 'table_name,record_id,field_name,locale',
      });

    if (error) {
      console.error('Error batch saving translations:', error);
      throw new Error(`Failed to batch save translations: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in saveTranslationsBatch:', error);
    throw error;
  }
}

// =============================================================================
// PRODUCT ACTIONS WITH TRANSLATIONS
// =============================================================================

/**
 * Get all products with their translations
 */
export async function getProductsWithTranslations(): Promise<Product[]> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('Products')
      .select(`
        *,
        translations:translations!translations_record_id_fkey(*)
      `)
      .eq('translations.table_name', 'Products')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products with translations:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductsWithTranslations:', error);
    return [];
  }
}

/**
 * Get a single product with translations
 */
export async function getProductWithTranslations(productId: string): Promise<Product | null> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('Products')
      .select(`
        *,
        translations:translations!translations_record_id_fkey(*),
        producer:Producers(*),
        category:ProductCategories(*)
      `)
      .eq('id', productId)
      .eq('translations.table_name', 'Products')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching product with translations:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getProductWithTranslations:', error);
    return null;
  }
}

/**
 * Save product translation
 */
export async function saveProductTranslation(
  productId: string,
  fieldName: 'name' | 'description' | 'shortDescription',
  locale: Locale,
  value: string
): Promise<void> {
  return saveTranslation('Products', productId, fieldName, locale, value);
}

/**
 * Delete product translation
 */
export async function deleteProductTranslation(
  productId: string,
  fieldName: 'name' | 'description' | 'shortDescription',
  locale: Locale
): Promise<void> {
  return deleteTranslation('Products', productId, fieldName, locale);
}

// =============================================================================
// PRODUCER ACTIONS WITH TRANSLATIONS
// =============================================================================

/**
 * Get all producers with their translations
 */
export async function getProducersWithTranslations(): Promise<Producer[]> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('Producers')
      .select(`
        *,
        translations:translations!translations_record_id_fkey(*)
      `)
      .eq('translations.table_name', 'Producers')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching producers with translations:', error);
      throw new Error(`Failed to fetch producers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProducersWithTranslations:', error);
    return [];
  }
}

/**
 * Get a single producer with translations
 */
export async function getProducerWithTranslations(producerId: string): Promise<Producer | null> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('Producers')
      .select(`
        *,
        translations:translations!translations_record_id_fkey(*)
      `)
      .eq('id', producerId)
      .eq('translations.table_name', 'Producers')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching producer with translations:', error);
      throw new Error(`Failed to fetch producer: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getProducerWithTranslations:', error);
    return null;
  }
}

/**
 * Save producer translation
 */
export async function saveProducerTranslation(
  producerId: string,
  fieldName: 'name' | 'description' | 'short_description' | 'bio_description',
  locale: Locale,
  value: string
): Promise<void> {
  return saveTranslation('Producers', producerId, fieldName, locale, value);
}

// =============================================================================
// CATEGORY ACTIONS WITH TRANSLATIONS
// =============================================================================

/**
 * Get all categories with their translations
 */
export async function getCategoriesWithTranslations(): Promise<Category[]> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('ProductCategories')
      .select(`
        *,
        translations:translations!translations_record_id_fkey(*)
      `)
      .eq('translations.table_name', 'ProductCategories')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching categories with translations:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategoriesWithTranslations:', error);
    return [];
  }
}

/**
 * Save category translation
 */
export async function saveCategoryTranslation(
  categoryId: string,
  fieldName: 'name' | 'description',
  locale: Locale,
  value: string
): Promise<void> {
  return saveTranslation('ProductCategories', categoryId, fieldName, locale, value);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all translations for multiple records
 */
export async function getBulkTranslations(
  tableName: string,
  recordIds: string[]
): Promise<Record<string, Translation[]>> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('table_name', tableName)
      .in('record_id', recordIds);

    if (error) {
      console.error('Error fetching bulk translations:', error);
      return {};
    }

    // Group translations by record_id
    const grouped: Record<string, Translation[]> = {};
    data?.forEach((translation) => {
      if (!grouped[translation.record_id]) {
        grouped[translation.record_id] = [];
      }
      grouped[translation.record_id].push(translation);
    });

    return grouped;
  } catch (error) {
    console.error('Error in getBulkTranslations:', error);
    return {};
  }
}

/**
 * Check if supabase connection is available
 */
export async function checkTranslationSupport(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
const supabase = await supabaseSSR(cookieStore);
    const { data, error } = await supabase
      .from('translations')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Translation support check failed:', error);
    return false;
  }
}