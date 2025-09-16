import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProducerTableFilters } from 'src/types/producer';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';
import { upperFirst } from 'es-toolkit';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    filters: UseSetStateReturn<IProducerTableFilters>;
};

export function ProducerTableFiltersResult({ filters, totalResults, sx }: Props) {
    const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

    const handleRemoveBio = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.bio.filter((item) => item !== inputValue);

            updateFilters({ bio: newValue });
        },
        [updateFilters, currentFilters.bio]
    );

    const handleRemoveEnabled = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.enabled.filter((item) => item !== inputValue);

            updateFilters({ enabled: newValue });
        },
        [updateFilters, currentFilters.enabled]
    );

    return (
        <FiltersResult totalResults={totalResults} onReset={() => resetFilters()} sx={sx}>
            <FiltersBlock label="Bio:" isShow={!!currentFilters.bio.length}>
                {currentFilters.bio.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(item === 'true' ? 'Igen' : 'Nem')}
                        onDelete={() => handleRemoveBio(item)}
                    />
                ))}
            </FiltersBlock>
            <FiltersBlock label="Engedélyezve:" isShow={!!currentFilters.enabled.length}>
                {currentFilters.enabled.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(item === 'true' ? 'Igen' : 'Nem')}
                        onDelete={() => handleRemoveEnabled(item)}
                    />
                ))}
            </FiltersBlock>
        </FiltersResult>
    );
}
