import type { IProducerFilters } from 'src/types/producer';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    filters: UseSetStateReturn<IProducerFilters>;
};

export function ProducerFiltersResult({ filters, totalResults, sx }: Props) {
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
                        label={item}
                        onDelete={() => handleRemoveBio(item)}
                    />
                ))}
            </FiltersBlock>
        </FiltersResult>
    );
}
