import type { IProductTableFilters } from 'src/types/product';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';
import { upperFirst } from 'es-toolkit';

import Chip from '@mui/material/Chip';

import { useCategories } from 'src/contexts/category-context';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

// Example PUBLISH_OPTIONS definition; replace with your actual options or import if defined elsewhere
const PUBLISH_OPTIONS = [
    { value: 'true', label: 'Közzétéve' },
    { value: 'false', label: 'Rejtve' },
];

// Example BIO_OPTIONS definition; replace with your actual options or import if defined elsewhere
const BIO_OPTIONS = [
    { value: 'true', label: 'Bio' },
    { value: 'false', label: 'Nem bio' },
];

type Props = FiltersResultProps & {
    filters: UseSetStateReturn<IProductTableFilters>;
};

export function ProductTableFiltersResult({ filters, totalResults, sx }: Props) {
    const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

    const handleRemoveStock = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.stock.filter((item) => item !== inputValue);

            updateFilters({ stock: newValue });
        },
        [updateFilters, currentFilters.stock]
    );

    const handleRemovePublish = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.publish.filter((item) => item !== inputValue);

            updateFilters({ publish: newValue });
        },
        [updateFilters, currentFilters.publish]
    );

    const handleRemoveBio = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.bio.filter((item) => item !== inputValue);

            updateFilters({ bio: newValue });
        },
        [updateFilters, currentFilters.bio]
    );

    const handleRemoveCategories = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.categories.filter((item) => item !== inputValue);

            updateFilters({ categories: newValue });
        },
        [updateFilters, currentFilters.categories]
    );

    return (
        <FiltersResult totalResults={totalResults} onReset={() => resetFilters()} sx={sx}>
            <FiltersBlock label="Stock:" isShow={!!currentFilters.stock.length}>
                {currentFilters.stock.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(item)}
                        onDelete={() => handleRemoveStock(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Közzétéve:" isShow={!!currentFilters.publish.length}>
                {currentFilters.publish.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(
                            PUBLISH_OPTIONS.find((option) => option.value === item)?.label || item
                        )}
                        onDelete={() => handleRemovePublish(item)}
                    />
                ))}
            </FiltersBlock>

            <FiltersBlock label="Bio:" isShow={!!currentFilters.bio.length}>
                {currentFilters.bio.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={upperFirst(
                            BIO_OPTIONS.find((option) => option.value === item)?.label || item
                        )}
                        onDelete={() => handleRemoveBio(item)}
                    />
                ))}
            </FiltersBlock>

            <CategoriesFilterBlock
                currentFilters={currentFilters}
                handleRemoveCategories={handleRemoveCategories}
            />
        </FiltersResult>
    );
}

// ----------------------------------------------------------------------

type CategoriesFilterBlockProps = {
    currentFilters: IProductTableFilters;
    handleRemoveCategories: (inputValue: string) => void;
};

function CategoriesFilterBlock({
    currentFilters,
    handleRemoveCategories,
}: Readonly<CategoriesFilterBlockProps>) {
    const { allCategories } = useCategories();

    return (
        <FiltersBlock label="Kategória:" isShow={!!currentFilters.categories.length}>
            {currentFilters.categories.map((item) => {
                const category = allCategories.find((cat) => String(cat.id) === item);
                return (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={category?.name || item}
                        onDelete={() => handleRemoveCategories(item)}
                    />
                );
            })}
        </FiltersBlock>
    );
}
