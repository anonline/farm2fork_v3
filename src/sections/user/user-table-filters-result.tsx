import type { IUserTableFilters } from 'src/types/user';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
    onResetPage: () => void;
    filters: UseSetStateReturn<IUserTableFilters>;
};

export function UserTableFiltersResult({ filters, onResetPage, totalResults, sx }: Props) {
    const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

    const handleRemoveKeyword = useCallback(() => {
        onResetPage();
        updateFilters({ name: '' });
    }, [onResetPage, updateFilters]);

    const handleRemoveRoleTab = useCallback(() => {
        onResetPage();
        updateFilters({ roleTab: 'all' });
    }, [onResetPage, updateFilters]);

    const handleRemoveRole = useCallback(
        (inputValue: string) => {
            const newValue = currentFilters.role.filter((item) => item !== inputValue);

            onResetPage();
            updateFilters({ role: newValue });
        },
        [onResetPage, updateFilters, currentFilters.role]
    );

    const handleReset = useCallback(() => {
        onResetPage();
        resetFilters();
    }, [onResetPage, resetFilters]);

    const roleTabLabel = () => {
        switch (currentFilters.roleTab) {
            case 'all':
                return 'Összes';
            case 'admin':
                return 'Admin';
            case 'corp':
                return 'Céges';
            case 'vip':
                return 'VIP';
            case 'user':
                return 'Magánszemély';
            default:
                return currentFilters.roleTab;
        }
    };

    return (
        <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
            <FiltersBlock label="Szerepkör:" isShow={currentFilters.roleTab !== 'all'}>
                <Chip
                    {...chipProps}
                    label={roleTabLabel()}
                    onDelete={handleRemoveRoleTab}
                    sx={{ textTransform: 'capitalize' }}
                />
            </FiltersBlock>

            {/*<FiltersBlock label="Jogosultság:" isShow={!!currentFilters.role.length}>
                {currentFilters.role.map((item) => (
                    <Chip
                        {...chipProps}
                        key={item}
                        label={item}
                        onDelete={() => handleRemoveRole(item)}
                    />
                ))}
            </FiltersBlock>*/}

            <FiltersBlock label="Keresés:" isShow={!!currentFilters.name}>
                <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
            </FiltersBlock>
        </FiltersResult>
    );
}
