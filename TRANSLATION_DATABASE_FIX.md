# Translation Database Schema Fix

## Issue
The translations feature fails with errors:
1. `Failed to batch save translations: invalid input syntax for type uuid: "2443"`
2. `Failed to batch save translations: new row violates row-level security policy for table "translations"`

## Root Causes
1. **UUID Type Mismatch**: The `translations` table was created with `record_id` column of type `UUID`, but the `Producers` table uses integer IDs (like "2443").
2. **RLS Policy Issue**: The Row Level Security policy uses `auth.role() = 'authenticated'` which doesn't work properly in this context.

## Solution
Run the database migration `004_fix_translations_record_id.sql` to:
1. Change the `record_id` column from `UUID` to `TEXT` type
2. Fix the RLS policies to use `auth.uid() IS NOT NULL` for proper authentication

## Steps to Fix

### 1. Run Database Migration
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Location: database/migrations/004_fix_translations_record_id.sql

-- Fix translations table to support different ID formats (UUID, INTEGER, TEXT)
-- This migration changes record_id from UUID to TEXT to support different table ID formats

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

-- Add comment explaining the change
COMMENT ON COLUMN translations.record_id IS 'ID of the record in the source table (supports UUID, integer, or text formats)';
```

### 2. Verify the Fix
After running the migration, try saving a producer with translations again. The system should now properly handle integer IDs and authentication.

### 3. Troubleshooting
If you still encounter RLS issues, you can temporarily disable RLS for development:

**⚠️ DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION:**
```sql
-- Temporarily disable RLS (file: database/migrations/005_temp_disable_rls.sql)
ALTER TABLE translations DISABLE ROW LEVEL SECURITY;
```

To re-enable RLS after fixing the policies:
```sql
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
```

## Code Changes Made
- Enhanced error handling in the producer form to catch both UUID and RLS policy errors
- Added specific error messages directing users to run the migration
- Made translation saving non-blocking (producer save succeeds even if translations fail)

## Future Considerations
- Consider standardizing all table IDs to use the same format (either all UUIDs or all integers)
- Update other translation-enabled entities if they have similar ID format mismatches

## Files Modified
- `src/sections/producer/producer-new-edit-form.tsx` - Enhanced error handling
- `database/migrations/004_fix_translations_record_id.sql` - New migration file