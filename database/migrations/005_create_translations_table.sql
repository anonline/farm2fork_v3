-- Migration: Create translations table for static translations management
-- Description: This table stores static translations for the application
-- that can be edited through the dashboard interface.

-- Create translations table
CREATE TABLE IF NOT EXISTS public.translations (
  id BIGSERIAL NOT NULL,
  language TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT translations_pkey PRIMARY KEY (id),
  CONSTRAINT translations_unique_key UNIQUE (language, namespace, key)
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_translations_lang_ns 
  ON public.translations USING BTREE (language, namespace) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_translations_key 
  ON public.translations USING BTREE (key) 
  TABLESPACE pg_default;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
DROP TRIGGER IF EXISTS translations_updated_at ON public.translations;
CREATE TRIGGER translations_updated_at 
  BEFORE UPDATE ON public.translations 
  FOR EACH ROW
  EXECUTE FUNCTION update_translations_updated_at();

-- Add some example translations (optional, can be removed)
INSERT INTO public.translations (language, namespace, key, value) VALUES
  ('hu', 'common', 'welcome', 'Üdvözöljük'),
  ('en', 'common', 'welcome', 'Welcome'),
  ('hu', 'common', 'signin_button_label', 'Bejelentkezés'),
  ('en', 'common', 'signin_button_label', 'Sign In')
ON CONFLICT (language, namespace, key) DO NOTHING;

-- Grant permissions (adjust based on your database setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.translations TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE translations_id_seq TO your_app_user;
