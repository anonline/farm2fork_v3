'use client';

import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ITranslationTableFilters } from 'src/types/translation';

import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = Readonly<{
    filters: UseSetStateReturn<ITranslationTableFilters>;
    onResetPage: () => void;
    canReset: boolean;
}>;

export function TranslationTableToolbar({ filters, onResetPage, canReset }: Props) {
    const { state: currentFilters, setState: updateFilters } = filters;

    const handleFilterSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onResetPage();
            updateFilters({ searchTerm: event.target.value });
        },
        [onResetPage, updateFilters]
    );

    return (
        <Stack
            spacing={2}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ p: 2.5 }}
        >
            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
                <TextField
                    fullWidth
                    value={currentFilters.searchTerm}
                    onChange={handleFilterSearch}
                    placeholder="Keresés kulcs, namespace vagy érték alapján..."
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Stack>
        </Stack>
    );
}
