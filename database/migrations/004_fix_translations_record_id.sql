-- Fix translations table to support different ID formats (UUID, INTEGER, TEXT)
-- This migration changes record_id from UUID to TEXT to support different table ID formats
-- Also fixes RLS policies for proper authentication

-- First drop the existing indexes and constraints that reference record_id
DROP INDEX IF EXISTS idx_translations_lookup;
DROP INDEX IF EXISTS idx_translations_table;
DROP INDEX IF EXISTS idx_translations_locale;

-- Drop the unique constraint temporarily
ALTER TABLE translations DROP CONSTRAINT IF EXISTS translations_table_name_record_id_field_name_locale_key;

-- Change record_id column type from UUID to TEXT
ALTER TABLE translations ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

-- Recreate the unique constraint
ALTER TABLE translations ADD CONSTRAINT translations_table_name_record_id_field_name_locale_key 
  UNIQUE (table_name, record_id, field_name, locale);

-- Recreate indexes for better performance
CREATE INDEX idx_translations_lookup ON translations(table_name, record_id, field_name, locale);
CREATE INDEX idx_translations_locale ON translations(locale);
CREATE INDEX idx_translations_table ON translations(table_name);
CREATE INDEX idx_translations_record ON translations(record_id);

-- Fix RLS policies - Drop existing policies and create new ones
DROP POLICY IF EXISTS "Anyone can view translations" ON translations;
DROP POLICY IF EXISTS "Authenticated users can manage translations" ON translations;

-- Create new RLS policies with better authentication check
CREATE POLICY "Public can view translations" ON translations 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert translations" ON translations 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update translations" ON translations 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete translations" ON translations 
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Add comment explaining the change
COMMENT ON COLUMN translations.record_id IS 'ID of the record in the source table (supports UUID, integer, or text formats)';