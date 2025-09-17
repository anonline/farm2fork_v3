import type { SelectChangeEvent } from '@mui/material';
import type { IOrderTableFilters } from 'src/types/order';
import type { IDatePickerControl } from 'src/types/common';
import type { UseSetStateReturn } from 'minimal-shared/hooks';

import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import DropdownMultiSelectFilter from 'src/components/filters/admin/dropdown-multiselect-filter';

// ----------------------------------------------------------------------

type Props = {
    dateError: boolean;
    onResetPage: () => void;
    filters: UseSetStateReturn<IOrderTableFilters>;
    options: {
        shipments: { value: string; label: string }[]
    };
}

export function OrderTableToolbar({ filters, onResetPage, dateError, options }: Props) {
    const menuActions = usePopover();

    const { state: currentFilters, setState: updateFilters } = filters;

    const [selectedShipments, setSelectedShipments] = useState<string[]>(currentFilters.shipments);

    const handleFilterName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onResetPage();
            updateFilters({ name: event.target.value });
        },
        [onResetPage, updateFilters]
    );

    const handleFilterStartDate = useCallback(
        (newValue: IDatePickerControl) => {
            onResetPage();
            updateFilters({ startDate: newValue });
        },
        [onResetPage, updateFilters]
    );

    const handleFilterEndDate = useCallback(
        (newValue: IDatePickerControl) => {
            onResetPage();
            updateFilters({ endDate: newValue });
        },
        [onResetPage, updateFilters]
    );

    const handleChangeShipment = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        console.log(value);
        const validValues = typeof value === 'string' 
            ? value.split(',').filter(Boolean) 
            : value.filter(Boolean);
        setSelectedShipments(validValues);
    }, [setSelectedShipments]);

    const handleFilterShipment = useCallback(() => {
        console.log('Applying shipment filter:', selectedShipments);
            onResetPage();
        console.log('Applying shipment filter:', selectedShipments);


        updateFilters({ shipments: selectedShipments });
    }, [selectedShipments, onResetPage, updateFilters]);

    
    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:printer-minimalistic-bold" />
                    Print
                </MenuItem>

                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:import-bold" />
                    Import
                </MenuItem>

                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:export-bold" />
                    Export
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            <Box
                sx={{
                    p: 2.5,
                    gap: 2,
                    display: 'flex',
                    pr: { xs: 2.5, md: 1 },
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-end', md: 'center' },
                }}
            >
                <DatePicker
                    label="Kezdő dátum"
                    value={currentFilters.startDate}
                    onChange={handleFilterStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                    sx={{ maxWidth: { md: 200 } }}
                />

                <DatePicker
                    label="Vég dátum"
                    value={currentFilters.endDate}
                    onChange={handleFilterEndDate}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: dateError,
                            helperText: dateError
                                ? 'Végdátumnak későbbinek kell lennie, mint a kezdő dátum.'
                                : null,
                        },
                    }}
                    sx={{
                        maxWidth: { md: 200 },
                        [`& .${formHelperTextClasses.root}`]: {
                            position: { md: 'absolute' },
                            bottom: { md: -40 },
                        },
                    }}

                />

                <DropdownMultiSelectFilter
                    label="Összesítő"
                    options={options.shipments}
                    selectedValues={selectedShipments}
                    onChange={handleChangeShipment}
                    onApply={handleFilterShipment}
                />

                <Box
                    sx={{
                        gap: 2,
                        width: 1,
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        value={currentFilters.name}
                        onChange={handleFilterName}
                        placeholder="Vásárló vagy rendelésszám keresése..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify
                                            icon="eva:search-fill"
                                            sx={{ color: 'text.disabled' }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <IconButton onClick={menuActions.onOpen}>
                        <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                </Box>
            </Box>

            {renderMenuActions()}
        </>
    );
}
