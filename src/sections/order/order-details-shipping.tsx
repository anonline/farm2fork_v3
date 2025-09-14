import type { IOrderShippingAddress } from 'src/types/order';
import type { IDatePickerControl } from 'src/types/common';

import dayjs from 'dayjs';
import { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Popover from '@mui/material/Popover';
import { Chip } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const StyledPickersDay = styled(PickersDay)({
  // Base styles can go here if needed
});

type Props = {
    shippingAddress?: IOrderShippingAddress;
    requestedShippingDate?: Date | string | null;
    onShippingDateChange?: (newDate: Date | null) => void;
};

export function OrderDetailsShipping({ 
    shippingAddress, 
    requestedShippingDate,
    onShippingDateChange 
}: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedDate, setSelectedDate] = useState<IDatePickerControl>(() => {
        if (!requestedShippingDate) return null;
        try {
            const dateObj = requestedShippingDate instanceof Date 
                ? requestedShippingDate 
                : new Date(requestedShippingDate);
            return isNaN(dateObj.getTime()) ? null : dayjs(dateObj);
        } catch {
            return null;
        }
    });

    const isPopoverOpen = Boolean(anchorEl);
    
    // Example highlighted dates - can be passed as props
    const highlightedDates = [dayjs().add(3, 'day'), dayjs().add(7, 'day')];

    // Create a component for custom day rendering
    const CustomDay = (props: PickersDayProps<dayjs.Dayjs>) => {
        const isHighlighted = highlightedDates.some((highlightedDate) =>
            props.day.isSame(highlightedDate, 'day')
        );

        // Extract highlighted prop to avoid passing it to DOM
        const { ...pickersDayProps } = props;

        return (
            <StyledPickersDay
                {...pickersDayProps}
                sx={{
                    ...(isHighlighted && {
                        border: '1px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                        },
                        '&:focus': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                        },
                    }),
                }}
            />
        );
    };
    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'N/A';
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 'N/A';
            return dateObj.toLocaleDateString('hu-HU');
        } catch {
            return 'N/A';
        }
    };

    const handleChipClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDateChange = (newDate: IDatePickerControl) => {
        setSelectedDate(newDate);
        const dateToSave = newDate ? newDate.toDate() : null;
        onShippingDateChange?.(dateToSave);
        setAnchorEl(null); // Close popover after selection
    };

    const handlePopoverClose = () => {
        // Reset to original date if closing without selection
        if (!requestedShippingDate) {
            setSelectedDate(null);
        } else {
            try {
                const dateObj = requestedShippingDate instanceof Date 
                    ? requestedShippingDate 
                    : new Date(requestedShippingDate);
                setSelectedDate(isNaN(dateObj.getTime()) ? null : dayjs(dateObj));
            } catch {
                setSelectedDate(null);
            }
        }
        setAnchorEl(null);
    };

    return (
        <>
            <CardHeader
                title="Szállítási adatok"
                action={
                    <IconButton>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                }
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Kért szállítási nap
                    </Box>

                    <Chip 
                        size='small' 
                        label={formatDate(requestedShippingDate)} 
                        onClick={handleChipClick}
                        sx={{ cursor: 'pointer' }}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap:1 }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: {xs:'100%', md:120}, flexShrink: 0 }}
                    >
                        Cím
                    </Box>

                    {shippingAddress?.fullAddress}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between'  }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Telefonszám
                    </Box>

                    {shippingAddress?.phoneNumber}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between'  }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Megjegyzés
                    </Box>
                    -
                </Box>
            </Stack>

            {/* Date Picker Popover */}
            <Popover
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <StaticDatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        minDate={dayjs()}
                        slots={{
                            day: CustomDay,
                        }}
                        showDaysOutsideCurrentMonth
                        displayStaticWrapperAs="desktop"
                    />
                </Box>
            </Popover>
        </>
    );
}
