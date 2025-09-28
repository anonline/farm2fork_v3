-- Create translations table for multilingual support
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  locale VARCHAR(5) NOT NULL DEFAULT 'hu',
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(table_name, record_id, field_name, locale)
);

-- Create indexes for better performance
CREATE INDEX idx_translations_lookup ON translations(table_name, record_id, field_name, locale);
CREATE INDEX idx_translations_locale ON translations(locale);
CREATE INDEX idx_translations_table ON translations(table_name);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view translations" ON translations 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage translations" ON translations 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON translations 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert some sample translations for existing products (if any)
-- This will be populated later through the admin interface

-- Add comments for documentation
COMMENT ON TABLE translations IS 'Stores multilingual translations for various database records';
COMMENT ON COLUMN translations.table_name IS 'Name of the source table (e.g., products, producers, categories)';
COMMENT ON COLUMN translations.record_id IS 'ID of the record being translated';
COMMENT ON COLUMN translations.field_name IS 'Name of the field being translated (e.g., name, description)';
COMMENT ON COLUMN translations.locale IS 'Language code (hu, en, de)';
COMMENT ON COLUMN translations.value IS 'Translated text value';