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

    return (
        <FiltersResult totalResults={totalResults} onReset={() => resetFilters()} sx={sx}>
            <FiltersBlock label="Bio:" isShow={!!currentFilters.bio.length}>
                {currentFilters.bio.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(item)}
                        onDelete={() => handleRemoveBio(item)}
                    />
                ))}
            </FiltersBlock>
        </FiltersResult>
    );
}
