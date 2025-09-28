'use client';

import { useState } from 'react';
import { useI18n, getSupportedLocales } from 'src/contexts/i18n-context';

type Locale = 'hu' | 'en' | 'de';

interface LanguageOption {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'flags';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSwitcher({
  className = '',
  variant = 'dropdown',
  showLabel = false,
  size = 'md',
}: LanguageSwitcherProps) {
  const { locale, changeLocale, t, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = async (newLocale: Locale) => {
    try {
      await changeLocale(newLocale);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const baseClasses = `inline-flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 mr-2 self-center">
            {t('language.selectLanguage')}:
          </span>
        )}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isLoading}
            className={`
              ${baseClasses} ${sizeClasses[size]} rounded-md
              ${locale === lang.code 
                ? 'bg-green-100 border-green-300 text-green-700' 
                : 'text-gray-700 hover:text-green-600'
              }
            `}
            title={lang.name}
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'flags') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 mr-2 self-center">
            {t('language.selectLanguage')}:
          </span>
        )}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isLoading}
            className={`
              ${baseClasses} ${sizeClasses[size]} rounded-full w-10 h-10
              ${locale === lang.code 
                ? 'ring-2 ring-green-500 ring-offset-2' 
                : 'hover:ring-1 hover:ring-gray-300'
              }
            `}
            title={lang.name}
          >
            <span className="text-lg">{lang.flag}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('language.selectLanguage')}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            ${baseClasses} ${sizeClasses[size]} rounded-md w-full
            text-left relative pr-10 min-w-[120px]
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center">
            <span className="mr-2">{currentLanguage.flag}</span>
            <span className="truncate">
              {showLabel ? currentLanguage.nativeName : currentLanguage.code.toUpperCase()}
            </span>
          </div>
          
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              <ul className="py-1 max-h-60 overflow-auto" role="listbox">
                {languages.map((lang) => (
                  <li key={lang.code} role="option" aria-selected={locale === lang.code}>
                    <button
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={isLoading}
                      className={`
                        w-full text-left px-3 py-2 flex items-center hover:bg-gray-50 transition-colors duration-150
                        ${locale === lang.code 
                          ? 'bg-green-50 text-green-700' 
                          : 'text-gray-700'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{lang.nativeName}</span>
                        <span className="text-xs text-gray-500">{lang.name}</span>
                      </div>
                      
                      {locale === lang.code && (
                        <span className="ml-auto">
                          <svg
                            className="h-4 w-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-md">
          <svg
            className="animate-spin h-4 w-4 text-green-600"
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
        </div>
      )}
    </div>
  );
}