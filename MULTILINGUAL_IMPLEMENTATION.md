# Farm2Fork v3 - Multilingual System Implementation

Ez a dokumentum leírja a Farm2Fork v3 projektben implementált többnyelvű rendszert.

## 🌍 Áttekintés

A rendszer **külön translations táblával** oldja meg a többnyelvűséget, **URL módosítása nélkül**. A fordítások az adatbázisban tárolódnak, és dinamikusan töltődnek be a kiválasztott nyelv szerint.

## 📋 Támogatott nyelvek

- 🇭🇺 **Magyar (hu)** - Alapértelmezett nyelv
- 🇬🇧 **Angol (en)** - Támogatott nyelv  
- 🇩🇪 **Német (de)** - Támogatott nyelv

## 🗂️ Implementált fájlok

### 1. Adatbázis
- `database/migrations/003_create_translations_table.sql` - Translations tábla és indexek

### 2. TypeScript típusok
- `src/types/database.types.ts` - Translation és multilingual típusok

### 3. Utility függvények
- `src/utils/translate-db.ts` - Fordítási segédfüggvények

### 4. Context és Hooks
- `src/contexts/i18n-context.tsx` - I18n context provider és hooks

### 5. Locale fájlok
- `src/locales/hu.json` - Magyar fordítások (UI szövegek)
- `src/locales/en.json` - Angol fordítások (UI szövegek)
- `src/locales/de.json` - Német fordítások (UI szövegek)

### 6. Server Actions
- `src/actions/translations.ts` - Adatbázis fordítás műveletek

### 7. Komponensek
- `src/components/language-switcher/` - Nyelvváltó komponens
- `src/components/translation-editor/` - Admin fordítás szerkesztő
- `src/components/translated-product-card/` - Példa fordított komponens

### 8. Konfiguráció
- `src/global-config.ts` - I18n beállítások hozzáadva
- `src/app/layout.tsx` - I18nProvider beágyazva

## 🚀 Használat

### 1. Adatbázis beállítás

Futtasd a SQL migrációt:
```sql
-- Futtasd: database/migrations/003_create_translations_table.sql
```

### 2. Alapvető használat komponensekben

```tsx
'use client';

import { useI18n } from 'src/contexts/i18n-context';

export default function MyComponent() {
  const { t, locale, changeLocale } = useI18n();

  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('products.description')}</p>
    </div>
  );
}
```

### 3. Adatbázis rekordok fordítása

```tsx
'use client';

import { useI18n } from 'src/contexts/i18n-context';
import { getProductsWithTranslations } from 'src/actions/translations';

export default function ProductList() {
  const { translateProduct } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await getProductsWithTranslations();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, []);

  return (
    <div>
      {products.map((product) => {
        const translatedProduct = translateProduct(product);
        return (
          <div key={product.id}>
            <h3>{translatedProduct.name}</h3>
            <p>{translatedProduct.description}</p>
          </div>
        );
      })}
    </div>
  );
}
```

### 4. Nyelvváltó hozzáadása

```tsx
import { LanguageSwitcher } from 'src/components/language-switcher';

export default function Navigation() {
  return (
    <nav>
      {/* Nav items */}
      <LanguageSwitcher variant="dropdown" showLabel={true} />
    </nav>
  );
}
```

### 5. Fordítások szerkesztése (Admin)

```tsx
import { TranslationEditor } from 'src/components/translation-editor';

export default function ProductEditPage({ product }) {
  return (
    <div>
      <TranslationEditor
        recordId={product.id}
        tableName="products"
        record={product}
        onSaved={() => console.log('Translations saved!')}
      />
    </div>
  );
}
```

## 🎛️ Konfigurációs beállítások

`src/global-config.ts` fájlban:

```typescript
i18n: {
  defaultLocale: 'hu',           // Alapértelmezett nyelv
  supportedLocales: ['hu', 'en', 'de'], // Támogatott nyelvek
  fallbackLocale: 'hu',          // Fallback nyelv
  useUrlLocale: false,           // URL-ben ne jelenjen meg a nyelv
  storageKey: 'farm2fork_locale' // LocalStorage kulcs
}
```

## 📊 Adatbázis struktúra

### Translations tábla

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,     -- 'products', 'producers', 'categories'
  record_id UUID NOT NULL,             -- A rekord ID-ja
  field_name VARCHAR(50) NOT NULL,     -- 'name', 'description', stb.
  locale VARCHAR(5) NOT NULL,          -- 'hu', 'en', 'de'
  value TEXT NOT NULL,                 -- A fordított szöveg
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(table_name, record_id, field_name, locale)
);
```

### Példa adatok

```sql
INSERT INTO translations (table_name, record_id, field_name, locale, value) VALUES
('products', 'uuid-123', 'name', 'en', 'Organic Apple'),
('products', 'uuid-123', 'name', 'de', 'Bio-Apfel'),
('products', 'uuid-123', 'description', 'en', 'Fresh organic apple from local producer'),
('products', 'uuid-123', 'description', 'de', 'Frischer Bio-Apfel vom lokalen Erzeuger');
```

## 🔧 API Reference

### useI18n Hook

```typescript
const {
  locale,              // Jelenlegi nyelv: 'hu' | 'en' | 'de'
  t,                   // Fordító függvény UI szövegekhez
  translateProduct,    // Termék fordítás függvény
  translateProducer,   // Termelő fordítás függvény  
  translateCategory,   // Kategória fordítás függvény
  changeLocale,        // Nyelvváltás függvény
  isLoading           // Fordítás töltés állapot
} = useI18n();
```

### Server Actions

```typescript
// Fordítások lekérdezése
await getTranslationsForRecord(tableName, recordId);

// Fordítás mentése
await saveTranslation(tableName, recordId, fieldName, locale, value);

// Fordítás törlése  
await deleteTranslation(tableName, recordId, fieldName, locale);

// Termékek fordításokkal
await getProductsWithTranslations();

// Termelők fordításokkal
await getProducersWithTranslations();
```

## 🎯 Főbb jellemzők

✅ **URL-ek nem változnak** - `/termekek` marad `/termekek`  
✅ **LocalStorage** - A nyelv kiválasztás perzisztálódik  
✅ **Automatikus fallback** - hu → en → eredeti érték  
✅ **TypeScript támogatás** - Teljes típusbiztonság  
✅ **Admin szerkesztő** - Dashboard fordítás kezelés  
✅ **Performancia** - Indexelt táblák, hatékony lekérdezések  
✅ **SEO barát** - HTML lang attribútum dinamikus frissítés  
✅ **Könnyen bővíthető** - Új nyelvek és mezők egyszerűen hozzáadhatók  

## 🚨 Fontos megjegyzések

1. **Adatbázis migráció szükséges** - Futtasd a SQL fájlt a Supabase-ben
2. **Környezeti változók** - A Supabase URL és kulcsok szükségesek
3. **Képek és statikus tartalom** - Csak a szöveges mezők fordíthatók
4. **Magyar az alapnyelv** - Az eredeti értékek mindig magyarul tárolódnak

## 🔄 Következő lépések

1. Futtasd az adatbázis migrációt
2. Indítsd el a fejlesztői szervert
3. Teszteld a nyelvváltót
4. Adj hozzá fordításokat az admin felületen
5. Integrálj több komponenst a fordítási rendszerrel

## 📖 További dokumentáció

- [Next.js i18n dokumentáció](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)