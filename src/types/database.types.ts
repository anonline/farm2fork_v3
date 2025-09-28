// Database types for multilingual support
export type Locale = 'hu' | 'en' | 'de';

export interface Translation {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string;
  locale: Locale;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface TranslatableRecord {
  id: string;
  translations?: Translation[];
}

// Enhanced product types with translations
export interface Product extends TranslatableRecord {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  producer_id: string;
  category_id?: string;
  image_url?: string;
  featured_image?: string;
  is_organic: boolean;
  bio: boolean;
  unit: string;
  stock_quantity: number;
  available: number;
  sku?: string;
  slug?: string;
  publish: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  producer?: Producer;
  category?: Category;
}

// Enhanced producer types with translations  
export interface Producer extends TranslatableRecord {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  bio_description?: string;
  location: string;
  contact_email: string;
  phone?: string;
  image_url?: string;
  featured_image?: string;
  cover_image?: string;
  company_name?: string;
  slug?: string;
  enabled: boolean;
  bio: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced category types with translations
export interface Category extends TranslatableRecord {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  cover_url?: string;
  parent_id?: string;
  slug?: string;
  enabled: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// Translation management types
export interface TranslationCreate {
  table_name: string;
  record_id: string;
  field_name: string;
  locale: Locale;
  value: string;
}

export interface TranslationUpdate {
  value: string;
  updated_at?: string;
}

export interface TranslationFields {
  [fieldName: string]: {
    [locale in Locale]?: string;
  };
}

// Helper type for translation editor
export interface TranslatableFields {
  products: {
    name: string;
    description: string;
    shortDescription: string;
  };
  producers: {
    name: string;
    description: string;
    short_description: string;
    bio_description: string;
  };
  categories: {
    name: string;
    description: string;
  };
}

export type TranslatableTableNames = keyof TranslatableFields;
export type TranslatableFieldNames<T extends TranslatableTableNames> = keyof TranslatableFields[T];

// Translation query helpers
export interface TranslationQuery {
  table_name: string;
  record_id: string;
  locale?: Locale;
  field_name?: string;
}

export interface TranslationBatch {
  translations: TranslationCreate[];
}