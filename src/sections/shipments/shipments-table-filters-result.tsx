import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IShipmentsTableFilters } from 'src/types/shipments';
import type { FiltersResultProps } from 'src/components/filters-result';

import { FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    filters: UseSetStateReturn<IShipmentsTableFilters>;
};

export function ShipmentsTableFiltersResult({ filters, totalResults, sx }: Props) {
    const { resetState: resetFilters } = filters;

    return (
        <FiltersResult totalResults={totalResults} onReset={() => resetFilters()} sx={sx}>
            {/* No filters implemented yet, but ready for future expansion */}
        </FiltersResult>
    );
}