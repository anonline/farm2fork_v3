import type { SelectChangeEvent } from '@mui/material/Select';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProducerTableFilters } from 'src/types/producer';

import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import { CustomPopover } from 'src/components/custom-popover';
import DropdownMultiSelectFilter from 'src/components/filters/admin/dropdown-multiselect-filter';

// ----------------------------------------------------------------------

type Props = {
    filters: UseSetStateReturn<IProducerTableFilters>;
    options: {
        bios: { value: string; label: string }[];
        enabled: { value: string; label: string }[];
    };
};

export function ProducerTableToolbar({ filters, options }: Props) {
    const menuActions = usePopover();

    const { state: currentFilters, setState: updateFilters } = filters;

    const [bio, setBio] = useState(currentFilters.bio);
    const [enabled, setEnabled] = useState(currentFilters.enabled);

    const handleChangeBio = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;

        setBio(typeof value === 'string' ? value.split(',') : value);
    }, []);

    const handleChangeEnabled = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;

        setEnabled(typeof value === 'string' ? value.split(',') : value);
    }, []);

    const handleFilterBio = useCallback(() => {
        updateFilters({ bio });
    }, [bio, updateFilters]);

    const handleFilterEnabled = useCallback(() => {
        updateFilters({ enabled });
    }, [enabled, updateFilters]);

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
         />
    );

    return (
        <>
            <DropdownMultiSelectFilter
                label="Engedélyezve"
                options={options.enabled}
                selectedValues={enabled}
                onChange={handleChangeEnabled}
                onApply={handleFilterEnabled}
            />

            <DropdownMultiSelectFilter
                label="Bio"
                options={options.bios}
                selectedValues={bio}
                onChange={handleChangeBio}
                onApply={handleFilterBio}
            />

            {renderMenuActions()}
        </>
    );
}
