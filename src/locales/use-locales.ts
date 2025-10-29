'use client';

import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouter, usePathname } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { allLangs } from './all-langs';
import { fallbackLng, languages as locales, changeLangMessages as messages } from './locales-config';

import type { LanguageValue } from './locales-config';

// ----------------------------------------------------------------------

export function useTranslate(namespace?: string) {
    const router = useRouter();
    const pathname = usePathname();

    const { t, i18n } = useTranslation(namespace);

    const fallback = allLangs.find((lang) => lang.value === fallbackLng) || allLangs[1];

    const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

    const onChangeLang = useCallback(
        async (newLang: LanguageValue) => {
            try {
                const langChangePromise = i18n.changeLanguage(newLang);

                const currentMessages = messages[newLang] || messages.en;

                toast.promise(langChangePromise, {
                    loading: currentMessages.loading,
                    success: () => currentMessages.success,
                    error: currentMessages.error,
                });

                if (currentLang) {
                    dayjs.locale(currentLang.adapterLocale);
                }

                // Cookie-ban tároljuk
                document.cookie = `i18next=${newLang}; path=/; max-age=31536000`;

                // URL átírás nyelvváltáskor
                let newPathname = pathname;

                // Távolítsuk el az összes nyelv prefix-et az aktuális URL-ből
                for (const locale of locales) {
                    if (pathname === `/${locale}`) {
                        newPathname = '/';
                    } else if (pathname.startsWith(`/${locale}/`)) {
                        newPathname = pathname.replace(`/${locale}`, '');
                    }
                }

                // Ha NEM magyar nyelv, adjuk hozzá a prefix-et
                if (newLang !== fallbackLng) {
                    newPathname = `/${newLang}${newPathname}`;
                }

                router.push(newPathname);
            } catch (error) {
                console.error(error);
            }
        },
        [currentLang, i18n, router, pathname],
    );

    return {
        t,
        i18n,
        onChangeLang,
        currentLang: currentLang ?? fallback,
    };
}
