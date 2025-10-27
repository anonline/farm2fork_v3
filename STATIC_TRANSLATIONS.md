# Statikus Fordítások (Static Translations) Management

## Overview
This feature provides a dashboard interface for managing static translations stored in the database. It allows administrators to edit translations across all supported languages in real-time without needing to modify code files.

## Features
- ✅ View all translations in a table format
- ✅ Inline editing of translation values
- ✅ Multi-language support (shows all languages as columns)
- ✅ Search/filter across namespaces, keys, and values
- ✅ Column sorting (A-Z, Z-A) for all columns
- ✅ Create new translation keys
- ✅ Delete translation keys
- ✅ Bulk operations support

## Access
Navigate to: **Dashboard → Statikus fordítások**
URL: `/dashboard/translation`

## Database Schema

### Table: `translations`
```sql
CREATE TABLE public.translations (
  id BIGSERIAL PRIMARY KEY,
  language TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (language, namespace, key)
);
```

### Indexes
- `idx_translations_lang_ns` - Index on (language, namespace) for fast queries
- `idx_translations_key` - Index on key for searching

### Trigger
- `translations_updated_at` - Automatically updates `updated_at` timestamp on changes

## Usage Guide

### Viewing Translations
1. Navigate to `/dashboard/translation`
2. All translations are displayed in table format
3. First column shows `namespace.key` (e.g., `common.signin_button_label`)
4. Subsequent columns show each language's translation

### Editing Translations
1. Click on any translation value cell
2. The cell becomes an editable text field
3. Make your changes
4. Press Enter or click the checkmark ✓ to save
5. Press Escape or click the X to cancel

### Searching/Filtering
Use the search bar to filter translations by:
- Namespace (e.g., "common")
- Key (e.g., "signin")
- Any language value (e.g., "Bejelentkezés")

### Sorting
Click on any column header to sort:
- First click: A-Z (ascending)
- Second click: Z-A (descending)
- Works for both the key column and language columns

### Creating New Translations
1. Click "Új fordítási kulcs" button
2. Enter:
   - **Namespace**: Category/group (e.g., "common", "product", "auth")
   - **Key**: Unique identifier (e.g., "button_save")
   - **Translations**: Values for each language
3. Click "Létrehozás"
4. The new key will be created across all languages

### Deleting Translations
1. Click the trash icon 🗑️ on the right side of a row
2. Confirm deletion
3. This deletes the key from ALL languages

## File Structure

```
src/
├── actions/
│   └── translation-management.ts       # Server actions for CRUD
├── app/
│   └── dashboard/
│       └── translation/
│           └── page.tsx                # Dashboard page
├── sections/
│   └── translation/
│       ├── index.ts                    # Exports
│       ├── translation-new-dialog.tsx  # Create dialog
│       ├── translation-table-toolbar.tsx # Search/filter toolbar
│       └── view/
│           ├── index.ts
│           └── translation-list-view.tsx # Main list view
├── types/
│   └── translation.ts                  # TypeScript types
├── routes/
│   └── paths.ts                        # Updated with translation path
└── layouts/
    └── nav-config-dashboard.tsx        # Updated navigation menu

database/
└── migrations/
    └── 005_create_translations_table.sql # Database migration
```

## API Functions

### `getAllTranslations()`
Fetches all translations from database, ordered by namespace and key.

### `updateTranslation(update: ITranslationUpdate)`
Updates a single translation value.

### `createTranslation(language, namespace, key, value)`
Creates a new translation entry.

### `deleteTranslation(namespace, key)`
Deletes translation entries by namespace and key (all languages).

### `createTranslationKey(namespace, key, values)`
Bulk creates translations for a new key across all languages.

## Integration with i18n

The translations in this table are loaded by the `DatabaseBackend` class defined in `src/actions/translation.ts`. This backend:
- Fetches translations from the database
- Caches them for 1 hour
- Integrates with i18next for client-side use

## Best Practices

### Naming Conventions
- **Namespace**: Use lowercase, descriptive names (e.g., `common`, `auth`, `product`, `checkout`)
- **Key**: Use snake_case (e.g., `signin_button_label`, `error_message_invalid_email`)
- **Values**: Use natural language appropriate for each locale

### Organization
Group related translations in the same namespace:
- `common.*` - General UI elements
- `auth.*` - Authentication/authorization
- `product.*` - Product-related text
- `order.*` - Order/checkout process
- `error.*` - Error messages
- `validation.*` - Form validation messages

### Editing Tips
1. Always provide translations for all supported languages
2. Keep translations consistent in tone and style
3. Test changes in the application after editing
4. Use placeholders consistently (e.g., `{{name}}` if using template strings)

## Security Considerations

- Only authenticated admin users should access this page
- Add proper role-based access control if needed
- Be cautious when deleting translations as it affects all languages
- Consider adding an audit log for tracking changes

## Future Enhancements

Potential improvements:
- [ ] Export/Import translations (CSV, JSON)
- [ ] Translation history/versioning
- [ ] Bulk edit operations
- [ ] Missing translation detection
- [ ] Translation completion percentage per language
- [ ] Preview translations in context
- [ ] Integration with translation services (Google Translate, DeepL)

## Troubleshooting

### Translations not updating in the app
- Clear the cache (restart the server or wait 1 hour for cache to expire)
- Check browser console for errors
- Verify database connection

### Cannot save changes
- Check Supabase connection
- Verify permissions on the `translations` table
- Check browser console for error messages

### Missing translations showing in UI
- Ensure translations exist for all required languages
- Check that namespace and key match what's used in the code
- Verify the DatabaseBackend is properly configured in i18next
