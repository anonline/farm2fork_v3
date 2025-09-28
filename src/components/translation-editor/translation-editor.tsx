'use client';

import type { Product, Producer, Category, Translation } from 'src/types/database.types';

import { useState, useEffect } from 'react';

import { useI18n } from 'src/contexts/i18n-context';
import {
  saveTranslation,
  deleteTranslation,
  getTranslationsForRecord,
} from 'src/actions/translations';

type Locale = 'hu' | 'en' | 'de';
type TranslatableType = 'products' | 'producers' | 'categories';

interface TranslationEditorProps {
  recordId: string;
  tableName: TranslatableType;
  record: Product | Producer | Category;
  onSaved?: () => void;
  onCancel?: () => void;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  originalValue: string;
}

// Field configurations for different record types
const getFieldConfigs = (
  tableName: TranslatableType,
  record: Product | Producer | Category
): FieldConfig[] => {
  let product;
  let producer;
  let category;

  switch (tableName) {
    case 'products':
      product = record as Product;
      return [
        { key: 'name', label: 'Name', type: 'text', originalValue: product.name },
        { key: 'description', label: 'Description', type: 'textarea', originalValue: product.description || '' },
        { key: 'shortDescription', label: 'Short Description', type: 'textarea', originalValue: product.shortDescription || '' },
      ];
    case 'producers':
      producer = record as Producer;
      return [
        { key: 'name', label: 'Name', type: 'text', originalValue: producer.name },
        { key: 'description', label: 'Description', type: 'textarea', originalValue: producer.description || '' },
        { key: 'short_description', label: 'Short Description', type: 'textarea', originalValue: producer.short_description || '' },
        { key: 'bio_description', label: 'Bio Description', type: 'textarea', originalValue: producer.bio_description || '' },
      ];
    case 'categories':
      category = record as Category;
      return [
        { key: 'name', label: 'Name', type: 'text', originalValue: category.name },
        { key: 'description', label: 'Description', type: 'textarea', originalValue: category.description || '' },
      ];
    default:
      return [];
  }
};

export default function TranslationEditor({
  recordId,
  tableName,
  record,
  onSaved,
  onCancel,
}: TranslationEditorProps) {
  const { t, locale: currentLocale } = useI18n();
  const [translations, setTranslations] = useState<Record<string, Record<Locale, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fieldConfigs = getFieldConfigs(tableName, record);
  const supportedLocales: Locale[] = ['hu', 'en', 'de'];
  const editableLocales = supportedLocales.filter(loc => loc !== 'hu');

  // Initialize translations
  useEffect(() => {
    loadTranslations();
  }, [recordId, tableName]);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const fetchedTranslations = await getTranslationsForRecord(tableName, recordId);
      
      // Initialize translation map with original values for Hungarian
      const translationMap: Record<string, Record<Locale, string>> = {};
      
      fieldConfigs.forEach(field => {
        translationMap[field.key] = {
          hu: field.originalValue,
          en: '',
          de: '',
        };
      });

      // Populate with existing translations
      fetchedTranslations.forEach((translation: Translation) => {
        if (translationMap[translation.field_name]) {
          translationMap[translation.field_name][translation.locale as Locale] = translation.value;
        }
      });

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTranslation = (fieldName: string, locale: Locale, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [locale]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savePromises: Promise<void>[] = [];
      const deletePromises: Promise<void>[] = [];

      for (const fieldName of Object.keys(translations)) {
        for (const locale of editableLocales) {
          const value = translations[fieldName][locale].trim();
          
          if (value) {
            // Save translation
            savePromises.push(
              saveTranslation(tableName, recordId, fieldName, locale, value)
            );
          } else {
            // Delete empty translation
            deletePromises.push(
              deleteTranslation(tableName, recordId, fieldName, locale)
            );
          }
        }
      }

      await Promise.all([...savePromises, ...deletePromises]);
      setHasChanges(false);
      onSaved?.();
    } catch (error) {
      console.error('Error saving translations:', error);
      alert(t('translations.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Are you sure? You will lose unsaved changes.')) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('translations.editTranslations')}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Record: {record.name} ({tableName})
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-8">
          {fieldConfigs.map((field) => (
            <div key={field.key} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {field.label}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hungarian (read-only) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('translations.hungarian')} {t('translations.originalValue')}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={translations[field.key]?.hu || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 resize-none"
                      rows={3}
                      readOnly
                    />
                  ) : (
                    <input
                      type="text"
                      value={translations[field.key]?.hu || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      readOnly
                    />
                  )}
                </div>

                {/* English */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('translations.english')}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={translations[field.key]?.en || ''}
                      onChange={(e) => updateTranslation(field.key, 'en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()} in English...`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={translations[field.key]?.en || ''}
                      onChange={(e) => updateTranslation(field.key, 'en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={`Enter ${field.label.toLowerCase()} in English...`}
                    />
                  )}
                </div>

                {/* German */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('translations.german')}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={translations[field.key]?.de || ''}
                      onChange={(e) => updateTranslation(field.key, 'de', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()} in German...`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={translations[field.key]?.de || ''}
                      onChange={(e) => updateTranslation(field.key, 'de', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={`Enter ${field.label.toLowerCase()} in German...`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.cancel')}
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSaving ? t('translations.saving') : t('translations.saveTranslations')}
          </button>
        </div>
        
        {hasChanges && (
          <div className="mt-3 text-sm text-amber-600">
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}