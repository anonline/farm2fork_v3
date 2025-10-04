import type { IDatePickerControl } from 'src/types/common';
import type { IOrderShippingAddress } from 'src/types/order';
import type { OrderHistoryEntry } from 'src/types/order-management';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import { supabase } from 'src/lib/supabase';
import { useShipments } from 'src/contexts/shipments/shipments-context';
import { updateOrderShippingAddress } from 'src/actions/order-management';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { OrderShippingAddressModal } from './components/order-shipping-address-modal';

// ----------------------------------------------------------------------

const StyledPickersDay = styled(PickersDay)({
    // Base styles can go here if needed
});

type Props = {
    shippingAddress?: IOrderShippingAddress;
    requestedShippingDate?: Date | string | null;
    onShippingDateChange?: (newDate: Date | null) => void;
    orderId?: string; // Add orderId prop for database updates
    customerId?: string; // Add customerId prop for fetching customer addresses
    onRefreshOrder?: () => void; // Add callback to refresh order data
    shipmentTime?: string; // Add shipment time range prop
    isEditable: boolean;
};

export function OrderDetailsShipping({
    shippingAddress,
    requestedShippingDate,
    onShippingDateChange,
    orderId,
    customerId,
    onRefreshOrder,
    shipmentTime = '',
    isEditable = true,
}: Readonly<Props>) {
    const { shipments, shipmentsLoading, setOrderToShipmentByDate } = useShipments();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedShipmentTime, setSelectedShipmentTime] = useState(shipmentTime || '');
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

    // Update selectedShipmentTime when shipmentTime prop changes (when order data loads)
    useEffect(() => {
        setSelectedShipmentTime(shipmentTime || '');
    }, [shipmentTime]);

    const isPopoverOpen = Boolean(anchorEl);

    // Example highlighted dates - can be passed as props
    const highlightedDates = shipmentsLoading
        ? []
        : shipments
            .slice(0, shipments.length > 14 ? 14 : shipments.length)
            .map(shipment => dayjs(shipment.date));

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

    // Format selectedDate for display
    const formatSelectedDate = (date: IDatePickerControl): string => {
        if (!date) return 'N/A';
        try {
            return date.format('YYYY.MM.DD');
        } catch {
            return 'N/A';
        }
    };

    // Use selectedDate if available, otherwise fall back to original prop
    const displayDate = selectedDate ? formatSelectedDate(selectedDate) : formatDate(requestedShippingDate);

    const handleChipClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDateChange = async (newDate: IDatePickerControl) => {
        setSelectedDate(newDate);
        const dateToSave = newDate ? newDate.toDate() : null;

        // Update in Supabase if orderId is provided
        if (orderId) {
            setIsUpdating(true);
            try {
                // First, get the current order to access existing history
                const { data: currentOrder, error: fetchError } = await supabase
                    .from('orders')
                    .select('history, history_for_user, planned_shipping_date_time')
                    .eq('id', orderId)
                    .single();

                if (fetchError) {
                    toast.error('Hiba történt a rendelés adatok lekérése során');
                    console.error('Supabase fetch error:', fetchError);
                    return;
                }

                // Format dates for history message
                const oldDate = currentOrder.planned_shipping_date_time
                    ? new Date(currentOrder.planned_shipping_date_time).toLocaleDateString('hu-HU')
                    : 'nincs megadva';
                const newDateFormatted = dateToSave
                    ? dateToSave.toLocaleDateString('hu-HU')
                    : 'nincs megadva';

                // Create history entry
                const historyEntry: OrderHistoryEntry = {
                    timestamp: new Date().toISOString(),
                    status: 'pending', // Keep current status, this is just a date change
                    note: `A kiszállítási dátum ${oldDate}-ről ${newDateFormatted}-ra változott.`,
                };

                // Prepare update data
                const updateData: any = {
                    planned_shipping_date_time: dateToSave ? dateToSave.toISOString() : null,
                    updated_at: new Date().toISOString(),
                    history: [...(currentOrder.history || []), historyEntry],
                };

                // Add to history_for_user if the field exists
                if (currentOrder.history_for_user !== undefined) {
                    const userMessage = historyEntry.note;
                    const currentHistory = currentOrder.history_for_user || '';
                    updateData.history_for_user = currentHistory 
                        ? `${currentHistory}\n${userMessage}` 
                        : userMessage;
                }

                const { error } = await supabase
                    .from('orders')
                    .update(updateData)
                    .eq('id', orderId);

                if (error) {
                    toast.error('Hiba történt a szállítási dátum mentése során');
                    console.error('Supabase update error:', error);
                    return;
                }

                // Show success toast
                toast.success('Szállítási dátum sikeresen frissítve!', { position: 'bottom-right' });

                // Call parent callback if provided
                onShippingDateChange?.(dateToSave);

                // Update shipment context
                if (dateToSave) {
                    setOrderToShipmentByDate(orderId, new Date(dateToSave));
                }

                // Refresh order data to update history timeline
                onRefreshOrder?.();
            } catch (error) {
                toast.error('Hiba történt a szállítási dátum mentése során');
                console.error('Error updating shipping date:', error);
            } finally {
                setIsUpdating(false);
            }
        } else {
            // Fallback to just calling parent callback
            onShippingDateChange?.(dateToSave);
        }

        setAnchorEl(null); // Close popover after selection
    };

    const handleShipmentTimeChange = async (event: any) => {
        const newTimeRange = event.target.value;
        setSelectedShipmentTime(newTimeRange);

        // Update in Supabase if orderId is provided
        if (orderId) {
            setIsUpdating(true);
            try {
                // First, get the current order to access existing history
                const { data: currentOrder, error: fetchError } = await supabase
                    .from('orders')
                    .select('history, history_for_user, shipment_time')
                    .eq('id', orderId)
                    .single();

                if (fetchError) {
                    toast.error('Hiba történt a rendelés adatok lekérése során');
                    console.error('Supabase fetch error:', fetchError);
                    return;
                }

                // Format time ranges for history message
                const oldTime = currentOrder.shipment_time || 'nincs megadva';
                const newTime = newTimeRange || 'nincs megadva';

                // Create history entry
                const historyEntry: OrderHistoryEntry = {
                    timestamp: new Date().toISOString(),
                    status: 'pending', // Keep current status, this is just a time change
                    note: `A szállítási idősáv ${oldTime}-ről ${newTime}-ra változott.`,
                };

                // Prepare update data
                const updateData: any = {
                    shipment_time: newTimeRange,
                    updated_at: new Date().toISOString(),
                    history: [...(currentOrder.history || []), historyEntry],
                };

                // Add to history_for_user if the field exists
                if (currentOrder.history_for_user !== undefined) {
                    const userMessage = historyEntry.note;
                    const currentHistory = currentOrder.history_for_user || '';
                    updateData.history_for_user = currentHistory 
                        ? `${currentHistory}\n${userMessage}` 
                        : userMessage;
                }

                const { error } = await supabase
                    .from('orders')
                    .update(updateData)
                    .eq('id', orderId);

                if (error) {
                    toast.error('Hiba történt a szállítási idősáv mentése során');
                    console.error('Supabase update error:', error);
                    return;
                }

                // Show success toast
                toast.success('Szállítási idősáv sikeresen frissítve!', { position: 'bottom-right' });

                // Refresh order data to update history timeline
                onRefreshOrder?.();
            } catch (error) {
                toast.error('Hiba történt a szállítási idősáv mentése során');
                console.error('Error updating shipment time:', error);
            } finally {
                setIsUpdating(false);
            }
        }
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

    const handleEditAddressClick = () => {
        setIsAddressModalOpen(true);
    };

    const handleSaveShippingAddress = async (updatedAddress: IOrderShippingAddress) => {
        if (!orderId) {
            toast.error('Hiányzó rendelés azonosító');
            return;
        }

        try {
            const result = await updateOrderShippingAddress(
                orderId,
                updatedAddress,
                'Szállítási cím módosítva az admin felületen keresztül'
            );

            if (result.error) {
                toast.error(result.error);
                return;
            }

            // Refresh order data to update the display
            onRefreshOrder?.();

            toast.success('Szállítási cím sikeresen frissítve!');
        } catch (error) {
            console.error('Error saving shipping address:', error);
            toast.error('Hiba történt a szállítási cím mentése során');
        }
    };

    return (
        <>
            <CardHeader
                title="Szállítási adatok"
                action={
                    isEditable && (
                    <IconButton onClick={handleEditAddressClick}>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    )
                }
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Összesítő dátuma
                    </Box>

                    <Chip
                        size='small'
                        label={displayDate}
                        onClick={handleChipClick}
                        sx={{
                            cursor: 'pointer',
                            opacity: isUpdating ? 0.6 : 1
                        }}
                        disabled={isUpdating}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Idősáv
                    </Box>

                    <Select
                        size="small"
                        value={selectedShipmentTime}
                        onChange={handleShipmentTimeChange}
                        displayEmpty
                        disabled={isUpdating}
                        sx={{
                            minWidth: 140,
                            opacity: isUpdating ? 0.6 : 1
                        }}
                    >
                        <MenuItem value="">?</MenuItem>
                        <MenuItem value="9:00-12:00">9:00-12:00</MenuItem>
                        <MenuItem value="12:00-15:00">12:00-15:00</MenuItem>
                        <MenuItem value="15:00-18:00">15:00-18:00</MenuItem>
                        <MenuItem value="18:00-20:00">18:00-20:00</MenuItem>
                    </Select>
                </Box>

                {shippingAddress?.company && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Cég
                        </Box>

                        {shippingAddress?.company}
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: { xs: '100%', md: 120 }, flexShrink: 0 }}
                    >
                        Cím
                    </Box>

                    {shippingAddress?.postcode} {shippingAddress?.city} {shippingAddress?.street} {shippingAddress?.houseNumber}{shippingAddress?.floor ? `, ${shippingAddress.floor}` : ''}{shippingAddress?.doorbell ? `, ${shippingAddress.doorbell}` : ''}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Telefonszám
                    </Box>

                    {shippingAddress?.phoneNumber || '-'}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Megjegyzés
                    </Box>
                    {shippingAddress?.note || '-'}
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
                <Box sx={{ p: 0 }}>
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

            {/* Shipping Address Modal */}
            <OrderShippingAddressModal
                open={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                currentAddress={shippingAddress}
                customerId={customerId}
                onSave={handleSaveShippingAddress}
            />
        </>
    );
}
