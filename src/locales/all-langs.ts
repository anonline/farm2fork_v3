'use client';

// core (MUI)
import {
    huHU as huHUCore,
} from '@mui/material/locale';
// date pickers (MUI)
import {
    huHU as huHUDate,
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
    huHU as huHUDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
    {
        value: 'en',
        label: 'English',
        countryCode: 'GB',
        adapterLocale: 'hu',
        numberFormat: { code: 'hu-HU', currency: 'HUF' },
        systemValue: {
            components: { ...huHUCore.components,
                ...huHUDate.components,
                ...huHUDataGrid.components },
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
                ...huHUDataGrid.components,
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
