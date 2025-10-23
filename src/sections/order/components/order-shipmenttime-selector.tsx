import type { IDatePickerControl } from "src/types/common";
import type { OrderHistoryEntry } from "src/types/order-management";

import dayjs from "dayjs";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { Box, Select, MenuItem } from "@mui/material";

import { supabase } from "src/lib/supabase";
import { Iconify } from "src/components/iconify";

type OrderShipmentTimeSelectorProps = {
    orderId?: string; // Optional, if not provided, won't update Supabase
    shipmentTime?: string; // Current shipment time value
    onRefreshOrder?: () => void; // Callback to refresh order data after update
    additionalPickUpTimes?: string[]; // Array of additional pickup times for the week, indexed 0=Monday to 6=Sunday
    requestedShippingDate?: any; // dayjs object representing the selected date
};

export default function OrderShipmentTimeSelector({ orderId, shipmentTime, onRefreshOrder, additionalPickUpTimes = ['zárva','zárva','zárva','zárva','zárva','zárva','zárva'], requestedShippingDate }: Readonly<OrderShipmentTimeSelectorProps>) {
    const [selectedShipmentTime, setSelectedShipmentTime] = useState(shipmentTime || '');
    const [isUpdating, setIsUpdating] = useState(false);
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

    useEffect(() => {
        // When additionalPickUpTimes change, validate and potentially update selectedShipmentTime
        // This ensures the selected time matches the pickup location's schedule for the selected day
        if (additionalPickUpTimes && additionalPickUpTimes.length > 0 && selectedDate) {
            // Convert dayjs day (0=Sunday, 1=Monday, ..., 6=Saturday) to array index (0=Monday, 6=Sunday)
            const dayJsDay = selectedDate.day();
            const arrayIndex = dayJsDay === 0 ? 6 : dayJsDay - 1;
            const timeForDay = additionalPickUpTimes[arrayIndex];

            // If there's a valid time for the selected day and it differs from current selection,
            // and the current selection is not one of the standard time slots, update it
            if (timeForDay && timeForDay !== 'zárva') {
                const standardTimes = ['9:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-20:00', ''];
                
                // If current selection is not a standard time and differs from the pickup location time,
                // update to the pickup location time
                if (!standardTimes.includes(selectedShipmentTime) && selectedShipmentTime !== timeForDay) {
                    setSelectedShipmentTime(timeForDay);
                }
            }
        }
    }, [additionalPickUpTimes, selectedDate, selectedShipmentTime]);

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

    const missingShipmentTime = selectedShipmentTime === '' || selectedShipmentTime === undefined || selectedShipmentTime === null || selectedShipmentTime === '???';

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
            >
                Idősáv
                <Iconify icon='solar:danger-triangle-bold' sx={{ ml: 0.5, width: 16, height: 16, color: 'warning.main', verticalAlign: 'middle', display: missingShipmentTime ? 'inline-block' : 'none' }} />
            </Box>

            <Select
                size="small"
                value={selectedShipmentTime}
                onChange={handleShipmentTimeChange}
                displayEmpty
                error={missingShipmentTime}
                disabled={isUpdating}
                sx={{
                    minWidth: 140,
                    opacity: isUpdating ? 0.6 : 1,
                    backgroundColor: ''
                }}
            >
                {(() => {
                    // Only render pickup location time if we have the data and a selected date
                    if (additionalPickUpTimes && additionalPickUpTimes.length > 0 && selectedDate) {
                        // selectedDate.day() returns 0-6 where 0=Sunday, 6=Saturday
                        // additionalPickUpTimes array is indexed 0-6 where 0=Monday, 6=Sunday
                        // Convert selectedDate.day() to match the array index
                        const dayJsDay = selectedDate.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday
                        const arrayIndex = dayJsDay === 0 ? 6 : dayJsDay - 1; // Convert to 0=Monday, 6=Sunday
                        const timeForDay = additionalPickUpTimes[arrayIndex];

                        // Only show if not closed and not empty
                        if (timeForDay && timeForDay !== 'zárva') {
                            return (
                                <MenuItem key={timeForDay} value={timeForDay} sx={{ backgroundColor: 'primary.light', color: 'primary.main', fontWeight: 'bold', justifyContent: 'center' }}>
                                    {timeForDay}
                                </MenuItem>
                            );
                        }
                    }
                    return null;
                })()}
                <MenuItem value="" sx={{ justifyContent: 'center' }}>???</MenuItem>
                <MenuItem value="9:00-12:00" sx={{ justifyContent: 'center' }}>9:00-12:00</MenuItem>
                <MenuItem value="12:00-15:00" sx={{ justifyContent: 'center' }}>12:00-15:00</MenuItem>
                <MenuItem value="15:00-18:00" sx={{ justifyContent: 'center' }}>15:00-18:00</MenuItem>
                <MenuItem value="18:00-20:00" sx={{ justifyContent: 'center' }}>18:00-20:00</MenuItem>
            </Select>
        </Box>
    );
}