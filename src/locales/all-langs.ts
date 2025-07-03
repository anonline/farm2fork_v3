'use client';

// core (MUI)
import {
    frFR as frFRCore,
    viVN as viVNCore,
    zhCN as zhCNCore,
    arSA as arSACore,
    huHU as huHUCore
} from '@mui/material/locale';
// date pickers (MUI)
import {
    enUS as enUSDate,
    frFR as frFRDate,
    viVN as viVNDate,
    zhCN as zhCNDate,
    huHU as huHUDate,
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
    enUS as enUSDataGrid,
    frFR as frFRDataGrid,
    viVN as viVNDataGrid,
    zhCN as zhCNDataGrid,
    arSD as arSDDataGrid,
    huHU as huHUDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
    {
        value: 'en',
        label: 'English',
        countryCode: 'GB',
        adapterLocale: 'en',
        numberFormat: { code: 'en-US', currency: 'USD' },
        systemValue: {
            components: { ...enUSDate.components, ...enUSDataGrid.components },
        },
    },
    {
        value: 'fr',
        label: 'French',
        countryCode: 'FR',
        adapterLocale: 'fr',
        numberFormat: { code: 'fr-Fr', currency: 'EUR' },
        systemValue: {
            components: {
                ...frFRCore.components,
                ...frFRDate.components,
                ...frFRDataGrid.components,
            },
        },
    },
    {
        value: 'vi',
        label: 'Vietnamese',
        countryCode: 'VN',
        adapterLocale: 'vi',
        numberFormat: { code: 'vi-VN', currency: 'VND' },
        systemValue: {
            components: {
                ...viVNCore.components,
                ...viVNDate.components,
                ...viVNDataGrid.components,
            },
        },
    },
    {
        value: 'cn',
        label: 'Chinese',
        countryCode: 'CN',
        adapterLocale: 'zh-cn',
        numberFormat: { code: 'zh-CN', currency: 'CNY' },
        systemValue: {
            components: {
                ...zhCNCore.components,
                ...zhCNDate.components,
                ...zhCNDataGrid.components,
            },
        },
    },
    {
        value: 'ar',
        label: 'Arabic',
        countryCode: 'SA',
        adapterLocale: 'ar-sa',
        numberFormat: { code: 'ar', currency: 'AED' },
        systemValue: {
            components: { ...arSACore.components, ...arSDDataGrid.components },
        },
    },
    {
        value: 'hu',
        label: 'Magyar',
        countryCode: 'HU',
        adapterLocale: 'hu',
        numberFormat: { code: 'hu-HU', currency: 'HUF' },
        systemValue: {
            components: {
                ...huHUCore.components,
                ...huHUDate.components,
                ...huHUDataGrid.components
            },
        },
    },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
