import type { IOrderTableFilters } from 'src/types/order';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    onResetPage: () => void;
    filters: UseSetStateReturn<IOrderTableFilters>;
    shipments: { value: string; label: string }[];
};

export function OrderTableFiltersResult({ filters, totalResults, onResetPage, sx, shipments }: Props) {
    const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

    const handleRemoveKeyword = useCallback(() => {
        onResetPage();
        updateFilters({ name: '' });
    }, [onResetPage, updateFilters]);

    const handleRemoveStatus = useCallback(() => {
        onResetPage();
        updateFilters({ status: 'all' });
    }, [onResetPage, updateFilters]);

    const handleRemoveDate = useCallback(() => {
        onResetPage();
        updateFilters({ startDate: null, endDate: null });
    }, [onResetPage, updateFilters]);

    const handleRemoveShipment = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.shipments.filter((item) => item !== inputValue);

            updateFilters({ shipments: newValue });
        },
        [updateFilters, currentFilters.shipments]
    );

    const handleReset = useCallback(() => {
        onResetPage();
        resetFilters();
    }, [onResetPage, resetFilters]);

    return (
        <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
            <FiltersBlock label="Státusz:" isShow={currentFilters.status !== 'all'}>
                <Chip
                    {...chipProps}
                    label={currentFilters.status}
                    onDelete={handleRemoveStatus}
                    sx={{ textTransform: 'capitalize' }}
                />
            </FiltersBlock>

            <FiltersBlock
                label="Dátum:"
                isShow={Boolean(currentFilters.startDate && currentFilters.endDate)}
            >
                <Chip
                    {...chipProps}
                    label={fDateRangeShortLabel(currentFilters.startDate, currentFilters.endDate)}
                    onDelete={handleRemoveDate}
                />
            </FiltersBlock>

            <FiltersBlock
                label="Összesítő:"
                isShow={!!currentFilters.shipments.length}
            >
                {currentFilters.shipments.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={shipments.find((shipment) => shipment.value === item)?.label || item}
                        onDelete={() => handleRemoveShipment(item)}
                    />
                ))}
            </FiltersBlock>           

            <FiltersBlock label="Szűrő:" isShow={!!currentFilters.name}>
                <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
            </FiltersBlock>
        </FiltersResult>
    );
}
