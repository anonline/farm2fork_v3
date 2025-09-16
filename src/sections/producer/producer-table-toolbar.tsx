import type { SelectChangeEvent } from '@mui/material/Select';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProducerTableFilters } from 'src/types/producer';

import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { usePopover } from 'minimal-shared/hooks';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { CustomPopover } from 'src/components/custom-popover';

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

            <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>

                <InputLabel htmlFor="filter-bio-select">Bio</InputLabel>
                <Select
                    multiple
                    value={bio}
                    onChange={handleChangeBio}
                    onClose={handleFilterBio}
                    input={<OutlinedInput label="Bio" />}
                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                    inputProps={{ id: 'filter-bio-select' }}
                    sx={{ textTransform: 'capitalize' }}
                >
                    {options.bios.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox
                                disableRipple
                                size="small"
                                checked={bio.includes(option.value)}
                                slotProps={{
                                    input: {
                                        id: `${option.value}-checkbox`,
                                        'aria-label': `${option.label} checkbox`,
                                    },
                                }}
                            />
                            {option.label}
                        </MenuItem>
                    ))}

                    <MenuItem
                        disableGutters
                        disableTouchRipple
                        onClick={handleFilterBio}
                        sx={[
                            (theme) => ({
                                justifyContent: 'center',
                                fontWeight: theme.typography.button,
                                bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                            }),
                        ]}
                    >
                        Alkalmaz
                    </MenuItem>
                </Select>
            </FormControl>

            {renderMenuActions()}
        </>
    );
}

type DropdownMultiSelectFilterProps = {
    label: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (event: SelectChangeEvent<string[]>) => void;
    onApply: () => void;
};

function DropdownMultiSelectFilter({ label, options, selectedValues, onChange, onApply }: Readonly<DropdownMultiSelectFilterProps>) {
    return (
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 }, mr: 2 }}>
            <InputLabel id={`filter-${label}-select-label`}>{label}</InputLabel>
            <Select
                multiple
                value={selectedValues}
                onChange={onChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => selected.map((value) => (value.toLowerCase() == 'true' ? 'Igen' : value.toLowerCase() == 'false' ? 'Nem' : value)).join(', ')}
                inputProps={{ id: `filter-${label}-select` }}
                sx={{ textTransform: 'capitalize' }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                            disableRipple
                            size="small"
                            checked={selectedValues.includes(option.value)}
                            slotProps={{
                                input: {
                                    id: `${option.value}-checkbox`,
                                    'aria-label': `${option.label} checkbox`,
                                },
                            }}
                        />
                        {option.label.toLowerCase() == 'true' ? 'Igen' : option.label.toLowerCase() == 'false' ? 'Nem' : option.label}
                    </MenuItem>
                ))}

                <MenuItem
                    disableGutters
                    disableTouchRipple
                    onClick={onApply}
                    sx={[
                        (theme) => ({
                            justifyContent: 'center',
                            fontWeight: theme.typography.button,
                            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                        }),
                    ]}
                >
                    Alkalmaz
                </MenuItem>
            </Select>
        </FormControl>
    );
}