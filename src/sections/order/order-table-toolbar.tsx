import type { IOrderTableFilters } from 'src/types/order';
import type { IDatePickerControl } from 'src/types/common';
import type { UseSetStateReturn } from 'minimal-shared/hooks';

import { usePopover } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Stack, type SelectChangeEvent } from '@mui/material';
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
        roles: { value: string; label: string }[]
        shippingMethods: { value: string; label: string }[]
        paymentMethods: { value: string; label: string }[]
        paymentStatuses: { value: string; label: string }[]
    };
}

export function OrderTableToolbar({ filters, onResetPage, dateError, options }: Readonly<Props>) {
    const menuActions = usePopover();

    const { state: currentFilters, setState: updateFilters } = filters;

    // State for mobile collapse functionality
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true); // Default collapsed on mobile

    const [selectedShipments, setSelectedShipments] = useState<string[]>(currentFilters.shipments);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(currentFilters.roles);
    const [selectedShippingMethods, setSelectedShippingMethods] = useState<string[]>(currentFilters.shippingMethods);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(currentFilters.paymentMethods);
    const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>(currentFilters.paymentStatuses);

    // Sync local state with filter state when filters change externally
    useEffect(() => {
        setSelectedShipments(currentFilters.shipments);
    }, [currentFilters.shipments]);

    useEffect(() => {
        setSelectedRoles(currentFilters.roles);
    }, [currentFilters.roles]);

    useEffect(() => {
        setSelectedShippingMethods(currentFilters.shippingMethods);
    }, [currentFilters.shippingMethods]);

    useEffect(() => {
        setSelectedPaymentMethods(currentFilters.paymentMethods);
    }, [currentFilters.paymentMethods]);

    useEffect(() => {
        setSelectedPaymentStatuses(currentFilters.paymentStatuses);
    }, [currentFilters.paymentStatuses]);

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
        
        const validValues = typeof value === 'string'
            ? value.split(',').filter(Boolean)
            : value.filter(Boolean);
        setSelectedShipments(validValues);
    }, [setSelectedShipments]);

    const handleChangeRole = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        
        const validValues = typeof value === 'string'
            ? value.split(',').filter(Boolean)
            : value.filter(Boolean);
        setSelectedRoles(validValues);
    }, [setSelectedRoles]);

    const handleChangeShippingMethod = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        
        const validValues = typeof value === 'string'
            ? value.split(',').filter(Boolean)
            : value.filter(Boolean);
        setSelectedShippingMethods(validValues);
    }, [setSelectedShippingMethods]);

    const handleChangePaymentMethod = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        
        const validValues = typeof value === 'string'
            ? value.split(',').filter(Boolean)
            : value.filter(Boolean);
        setSelectedPaymentMethods(validValues);
    }, [setSelectedPaymentMethods]);

    const handleChangePaymentStatus = useCallback((event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        
        const validValues = typeof value === 'string'
            ? value.split(',').filter(Boolean)
            : value.filter(Boolean);
        setSelectedPaymentStatuses(validValues);
    }, [setSelectedPaymentStatuses]);

    const handleFilterShippingMethod = useCallback(() => {
        onResetPage();
        updateFilters({ shippingMethods: selectedShippingMethods });
    }, [selectedShippingMethods, onResetPage, updateFilters]);

    const handleFilterPaymentMethod = useCallback(() => {
        onResetPage();
        updateFilters({ paymentMethods: selectedPaymentMethods });
    }, [selectedPaymentMethods, onResetPage, updateFilters]);

    const handleFilterPaymentStatus = useCallback(() => {
        onResetPage();
        updateFilters({ paymentStatuses: selectedPaymentStatuses });
    }, [selectedPaymentStatuses, onResetPage, updateFilters]);


    const handleFilterShipment = useCallback(() => {
        onResetPage();
        updateFilters({ shipments: selectedShipments });
    }, [selectedShipments, onResetPage, updateFilters]);

    const handleFilterRole = useCallback(() => {
        onResetPage();
        updateFilters({ roles: selectedRoles });
    }, [selectedRoles, onResetPage, updateFilters]);

    const handleToggleFilters = useCallback(() => {
        setIsFiltersCollapsed(!isFiltersCollapsed);
    }, [isFiltersCollapsed]);

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem onClick={() => menuActions.onClose()}>
                    <Iconify icon="solar:export-bold" />
                    Export
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return (

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
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                {/* Mobile filter toggle button */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Szűrők
                    </Typography>
                    <IconButton
                        onClick={handleToggleFilters}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <Iconify 
                            icon={isFiltersCollapsed ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-upward-fill"} 
                        />
                    </IconButton>
                </Box>

                {/* Collapsible filters section */}
                {/* On mobile: show/hide based on collapsed state, On desktop: always show */}
                <Box sx={{ 
                    display: { 
                        xs: isFiltersCollapsed ? 'none' : 'block', 
                        md: 'block' 
                    } 
                }}>
                    <Stack spacing={2} sx={{ width: '100%' }} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap">
                        <DatePicker
                            label="Kezdő dátum"
                            value={currentFilters.startDate}
                            onChange={handleFilterStartDate}
                            slotProps={{ textField: { fullWidth: true } }}
                            sx={{ minWidth: { sm: 200, md: 200 }, maxWidth: { md: 200 } }}
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
                                minWidth: { sm: 200, md: 200 },
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

                        <DropdownMultiSelectFilter
                            label="Szerepkör"
                            options={options.roles}
                            selectedValues={selectedRoles}
                            onChange={handleChangeRole}
                            onApply={handleFilterRole}
                        />

                        <DropdownMultiSelectFilter
                            label="Szállítási mód"
                            options={options.shippingMethods}
                            selectedValues={selectedShippingMethods}
                            onChange={handleChangeShippingMethod}
                            onApply={handleFilterShippingMethod}
                        />

                        <DropdownMultiSelectFilter
                            label="Fizetési mód"
                            options={options.paymentMethods}
                            selectedValues={selectedPaymentMethods}
                            onChange={handleChangePaymentMethod}
                            onApply={handleFilterPaymentMethod}
                        />

                        <DropdownMultiSelectFilter
                            label="Fizetés állapota"
                            options={options.paymentStatuses}
                            selectedValues={selectedPaymentStatuses}
                            onChange={handleChangePaymentStatus}
                            onApply={handleFilterPaymentStatus}
                        />
                    </Stack>
                    </Box>                <Box
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


                </Box>
            </Stack>

        </Box>
    );
}
