import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ICategoryTableFilter } from 'src/types/category';
import type { FiltersResultProps } from 'src/components/filters-result';

import { FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
  filters: UseSetStateReturn<ICategoryTableFilter>;
};

export function CategoryTableFiltersResult({ filters, totalResults, sx }: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  
  return (
    <FiltersResult totalResults={totalResults} onReset={() => resetFilters()} sx={sx} />
  );
}
