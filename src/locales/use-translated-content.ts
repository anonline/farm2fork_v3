'use client';

import { useTranslate } from './use-locales';

import type { LanguageValue } from './locales-config';

interface TranslatedField {
  [key: string]: string;
}

interface WithTranslations {
  translations?: Array<{
    language: string;
    [key: string]: any;
  }>;
}

export function useTranslatedContent() {
  const { currentLang } = useTranslate();

  /**
   * Visszaadja a fordított mezőt az aktuális nyelven
   * Ha nincs fordítás, visszaadja az alapértelmezett értéket
   */
  const getTranslatedField = <T extends WithTranslations>(
    item: T,
    fieldName: keyof T,
    defaultValue: string = ''
  ): string => {
    // Ha nincs translations tömb, visszaadjuk az eredeti mezőt
    if (!item.translations || item.translations.length === 0) {
      return (item[fieldName] as string) || defaultValue;
    }

    // Keressük meg az aktuális nyelv fordítását
    const translation = item.translations.find(
      (t) => t.language === currentLang.value
    );

    // Ha van fordítás, visszaadjuk azt
    if (translation && translation[fieldName as string]) {
      return translation[fieldName as string];
    }

    // Fallback: angol fordítás
    const englishTranslation = item.translations.find(
      (t) => t.language === 'en'
    );

    if (englishTranslation && englishTranslation[fieldName as string]) {
      return englishTranslation[fieldName as string];
    }

    // Végső fallback: eredeti mező vagy üres string
    return (item[fieldName] as string) || defaultValue;
  };

  /**
   * Több mező fordítása egyszerre
   */
  const getTranslatedFields = <T extends WithTranslations>(
    item: T,
    fields: Array<keyof T>
  ): Record<string, string> => {
    const result: Record<string, string> = {};

    fields.forEach((field) => {
      result[field as string] = getTranslatedField(item, field);
    });

    return result;
  };

  return {
    getTranslatedField,
    getTranslatedFields,
    currentLanguage: currentLang.value as LanguageValue,
  };
}