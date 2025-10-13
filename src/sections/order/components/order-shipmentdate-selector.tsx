import type { PickersDayProps} from "@mui/x-date-pickers";
import type { IDatePickerControl } from "src/types/common";
import type { OrderHistoryEntry } from "src/types/order-management";

import dayjs from "dayjs";
import { toast } from "sonner";
import { useState } from "react";

import { Box, Chip, styled, Popover } from "@mui/material";
import { PickersDay, StaticDatePicker } from "@mui/x-date-pickers";

import { supabase } from "src/lib/supabase";
import { useShipments } from "src/contexts/shipments/shipments-context";

type Props = {
    orderId?: string; // Optional, if not provided, won't update Supabase
    onRefreshOrder?: () => void; // Callback to refresh order data after update
    requestedShippingDate?: Date | string | null;
    onShippingDateChange?: (newDate: Date | null) => void;
};

const StyledPickersDay = styled(PickersDay)({
    // Base styles can go here if needed
});

export default function OrderShipmentDateSelector({ orderId, onRefreshOrder, requestedShippingDate, onShippingDateChange }: Readonly<Props>) {
    const { shipments, shipmentsLoading, setOrderToShipmentByDate } = useShipments();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [isUpdating, setIsUpdating] = useState(false);
    const isPopoverOpen = Boolean(anchorEl);

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

    // Example highlighted dates - can be passed as props
    const highlightedDates = shipmentsLoading
        ? []
        : shipments
            .slice(0, shipments.length > 14 ? 14 : shipments.length)
            .map(shipment => dayjs(shipment.date));

    const formatSelectedDate = (date: IDatePickerControl): string => {
        if (!date) return 'N/A';
        try {
            return date.format('YYYY.MM.DD');
        } catch {
            return 'N/A';
        }
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

    const displayDate = selectedDate ? formatSelectedDate(selectedDate) : formatDate(requestedShippingDate);

    const handleChipClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

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
        </>
    );
}
