'use client';

import type { IOrderData } from 'src/types/order-management';
import type { IShipment } from 'src/types/shipments';

import dayjs, { type Dayjs } from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getAllOrders } from 'src/actions/order-management';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { OrdersTable } from './new-shipment-orders-table';
import { PickersDayProps } from 'node_modules/@mui/lab/esm/PickersDay/PickersDay';




// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
};

export function NewShipmentModal({ open, onClose }: Props) {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [orders, setOrders] = useState<IOrderData[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [existingDates, setExistingDates] = useState<string[]>([]);

    const { shipments, setOrderToShipmentByDate } = useShipments();

    // Get existing shipment dates for validation
    useEffect(() => {
        if (shipments) {
            const dates = shipments
                .map(shipment => shipment.date)
                .filter(Boolean)
                .map(date => dayjs(date).format('YYYY-MM-DD'));
            setExistingDates(dates);
        }
    }, [shipments]);

    // Fetch orders when modal opens
    useEffect(() => {
        if (open) {
            fetchOrders();
        } else {
            // Reset state when modal closes
            setSelectedDate(null);
            setSelectedOrders([]);
            setOrders([]);
        }
    }, [open]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const result = await getAllOrders();
            if (result.error) {
                toast.error('Hiba a rendelések betöltése során!');
                return;
            }
            setOrders(result.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Hiba a rendelések betöltése során!');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
    };

    const handleOrderToggle = useCallback((orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    }, []);

    const isDateDisabled = (date: Dayjs) => {
        return existingDates.includes(date.format('YYYY-MM-DD'));
    };

    const handleSave = () => {
        if (!selectedDate) {
            toast.error('Kérlek válassz egy dátumot!');
            return;
        }

        if (selectedOrders.length === 0) {
            toast.error('Kérlek válassz legalább egy rendelést!');
            return;
        }

        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!selectedDate) return;

        setLoading(true);
        try {
            // Create a date string in YYYY-MM-DD format to avoid timezone issues
            // This ensures the date is stored exactly as selected, regardless of timezone
            const dateString = selectedDate.format('YYYY-MM-DD');
            const dateValue = new Date(dateString);

            console.log('Selected date (Dayjs):', selectedDate.format('YYYY-MM-DD'));
            console.log('Date string being sent to API:', dateString);
            console.log('Date object being sent to API:', dateValue);

            // Update orders to new shipment
            await Promise.all(
                selectedOrders.map(orderId =>
                    setOrderToShipmentByDate(orderId, dateValue)
                )
            );

            toast.success('Új szállítási összesítő sikeresen létrehozva!');
            onClose();
        } catch (error) {
            console.error('Error creating shipment:', error);
            toast.error('Hiba az összesítő létrehozása során!');
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    const ordersWithShipments = selectedOrders
        .map(orderId => orders.find(order => order.id === orderId))
        .filter(Boolean)
        .filter(order => order!.shipmentId !== null);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
                }}
            >
                <DialogTitle>Új szállítási összesítő</DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                    <Box>
                        <DatePicker
                            label="Szállítás dátuma"
                            value={selectedDate}
                            onChange={handleDateChange}
                            shouldDisableDate={isDateDisabled}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    helperText: 'Válassz egy egyedi dátumot a szállítási összesítőhöz'
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <OrdersTable
                            orders={orders}
                            selectedOrders={selectedOrders}
                            onOrderToggle={handleOrderToggle}
                            loading={loading}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>
                        Mégse
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!selectedDate || selectedOrders.length === 0 || loading}
                    >
                        Mentés ({selectedOrders.length} rendelés)
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Rendelések áthelyezése"
                content={
                    <Box>
                        <Box sx={{ mb: 2 }}>
                            {ordersWithShipments.length > 0 && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                                    <strong>Figyelem!</strong> {ordersWithShipments.length} rendelés már
                                    hozzá van rendelve egy másik szállítási összesítőhöz. Ezek át lesznek helyezve
                                    az új összesítőbe.
                                </Box>
                            )}
                            Biztosan létrehozod az új szállítási összesítőt{' '}
                            <strong>{selectedDate?.format('YYYY. MM. DD.')}</strong> dátummal{' '}
                            <strong>{selectedOrders.length}</strong> rendeléssel?
                        </Box>
                    </Box>
                }
                action={
                    <Button
                        variant="contained"
                        onClick={handleConfirmSave}
                        disabled={loading}
                    >
                        Igen, létrehozom
                    </Button>
                }
            />
        </>
    );
}
