import type { IOrderDelivery } from 'src/types/order';
import type { OrderHistoryEntry } from 'src/types/order-management';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';

import { supabase } from 'src/lib/supabase';
import { useGetAddresses } from 'src/actions/address';
import { getOrderById } from 'src/actions/order-management';
import { useGetPickupLocations } from 'src/actions/pickup-location';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
    delivery?: IOrderDelivery;
    isEditable?: boolean;
    orderId?: string;
    customerId?: string;
    onRefreshOrder?: () => void;
};

export function OrderDetailsDelivery({ delivery, isEditable, orderId, customerId, onRefreshOrder }: Readonly<Props>) {
    const pickuplocations = useGetPickupLocations();
    const { addresses: addressData } = useGetAddresses(customerId);

    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedShipBy, setSelectedShipBy] = useState(delivery?.shipBy || 'Házhozszállítás');
    const [selectedPickupLocationId, setSelectedPickupLocationId] = useState<string | null>(
        delivery?.shipBy === 'Személyes átvétel' && delivery?.address?.id ? delivery.address.id.toString() : null
    );

    const selectedPickupLocation = selectedPickupLocationId
        ? pickuplocations?.locations.find(loc => loc.id.toString() === selectedPickupLocationId) ?? null
        : null;

    const createShippingAddressFromDefault = useCallback((defaultAddress: any) => {
        const address = `${defaultAddress.postcode} ${defaultAddress.city}, ${defaultAddress.street} ${defaultAddress.houseNumber}`;
        const floor = defaultAddress.floor ? `, ${defaultAddress.floor}` : '';
        const doorbell = defaultAddress.doorbell ? `, ${defaultAddress.doorbell}` : '';

        return {
            fullAddress: `${address}${floor}${doorbell}`,
            name: defaultAddress.fullName,
            company: defaultAddress.companyName,
            postcode: defaultAddress.postcode,
            city: defaultAddress.city,
            street: defaultAddress.street,
            houseNumber: defaultAddress.houseNumber,
            floor: defaultAddress.floor,
            doorbell: defaultAddress.doorbell,
            phoneNumber: defaultAddress.phone,
            note: defaultAddress.comment,
            email: '', // Will be filled from order data
        };
    }, []);

    const updateOrderInDatabase = useCallback(async (
        orderIdParam: string,
        newShipBy: string,
        newDeliveryAddress: any,
        shippingAddress: any,
        historyNote: string
    ) => {
        const { order } = await getOrderById(orderIdParam);
        if (!order) {
            throw new Error('Order not found');
        }

        const historyEntry: OrderHistoryEntry = {
            timestamp: new Date().toISOString(),
            status: order.orderStatus,
            note: historyNote,
        };

        const updateData: any = {
            delivery_method: newShipBy,
            delivery_address: newDeliveryAddress,
            history: [...(order.history || []), historyEntry],
            updated_at: new Date().toISOString(),
        };

        if (newShipBy === 'Házhozszállítás' && shippingAddress) {
            updateData.shipping_address = shippingAddress;
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderIdParam);

        if (error) {
            throw error;
        }
    }, []);

    const updateLocalStorage = useCallback((orderIdParam: string, newShipBy: string, newDeliveryAddress: any, shippingAddress: any) => {
        const orderData = localStorage.getItem(`order-${orderIdParam}`);
        if (orderData) {
            const parsedData = JSON.parse(orderData);
            parsedData.delivery = { shipBy: newShipBy, address: newDeliveryAddress };
            if (shippingAddress) parsedData.shippingAddress = shippingAddress;
            localStorage.setItem(`order-${orderIdParam}`, JSON.stringify(parsedData));
        }
    }, []);

    const handleShipByChange = useCallback(async (newShipBy: string) => {
        if (!isEditable || !orderId || isUpdating) return;

        setIsUpdating(true);
        setSelectedShipBy(newShipBy);

        try {
            let newDeliveryAddress = null;
            let shippingAddress = null;

            if (newShipBy === 'Személyes átvétel') {
                // Set to first available pickup location if none selected
                if (!selectedPickupLocationId && pickuplocations?.locations.length > 0) {
                    const firstPickupLocation = pickuplocations.locations[0];
                    setSelectedPickupLocationId(firstPickupLocation.id.toString());
                    newDeliveryAddress = { id: firstPickupLocation.id.toString() };
                } else if (selectedPickupLocationId) {
                    newDeliveryAddress = { id: selectedPickupLocationId };
                }
            } else {
                // Házhozszállítás - restore user's default or first shipping address
                const defaultAddress = addressData?.shippingAddresses?.find((addr: any) => addr.isDefault) ||
                    addressData?.shippingAddresses?.[0];

                if (defaultAddress) {
                    shippingAddress = createShippingAddressFromDefault(defaultAddress);
                }
                setSelectedPickupLocationId(null);
            }

            const historyNote = `Szállítási mód módosítva: ${delivery?.shipBy || 'nincs megadva'} → ${newShipBy}`;

            await updateOrderInDatabase(orderId, newShipBy, newDeliveryAddress, shippingAddress, historyNote);
            updateLocalStorage(orderId, newShipBy, newDeliveryAddress, shippingAddress);

            toast.success('Szállítási mód sikeresen frissítve!');
            onRefreshOrder?.();
        } catch (error) {
            console.error('Error updating delivery method:', error);
            toast.error('Hiba történt a szállítási mód mentése során');
            setSelectedShipBy(delivery?.shipBy || 'Házhozszállítás'); // Revert
        } finally {
            setIsUpdating(false);
        }
    }, [isEditable, orderId, isUpdating, selectedPickupLocationId, pickuplocations?.locations, addressData?.shippingAddresses, delivery?.shipBy, onRefreshOrder, createShippingAddressFromDefault, updateOrderInDatabase, updateLocalStorage]);

    const handlePickupLocationChange = useCallback(async (newLocationId: string) => {
        if (!isEditable || !orderId || isUpdating) return;

        setIsUpdating(true);
        setSelectedPickupLocationId(newLocationId);

        try {
            // Get current order to append to history
            const { order } = await getOrderById(orderId);
            if (!order) {
                toast.error('Order not found');
                return;
            }

            const selectedLocation = pickuplocations?.locations.find(loc => loc.id.toString() === newLocationId);
            const newDeliveryAddress = {
                id: selectedLocation?.id.toString(),
                addressType: 'pickup',
                primary: false,
                name: `${order.customerName || ''}`.trim(),
                postcode: selectedLocation?.postcode,
                city: selectedLocation?.city,
                street: selectedLocation?.address,
                floor: '',
                houseNumber: '',
                doorbell: '',
                note: selectedLocation?.note || '',
                fullAddress: `${selectedLocation?.postcode} ${selectedLocation?.city}, ${selectedLocation?.address}`,
                phoneNumber: '',
                company: '',
            };

            // Create history entry
            const historyEntry: OrderHistoryEntry = {
                timestamp: new Date().toISOString(),
                status: order.orderStatus,
                note: `Átvételi pont módosítva: ${selectedLocation?.name || 'Ismeretlen'}`,
            };

            // Update order in database
            const updateData = {
                shipping_address: newDeliveryAddress,
                history: [...(order.history || []), historyEntry],
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) {
                toast.error('Hiba történt az átvételi pont mentése során');
                console.error('Supabase update error:', error);
                return;
            }

            // Update localStorage
            const orderData = localStorage.getItem(`order-${orderId}`);
            if (orderData) {
                const parsedData = JSON.parse(orderData);
                parsedData.delivery = { shipBy: 'Személyes átvétel', address: newDeliveryAddress };
                localStorage.setItem(`order-${orderId}`, JSON.stringify(parsedData));
            }

            toast.success('Átvételi pont sikeresen frissítve!');
            onRefreshOrder?.();
        } catch (error) {
            console.error('Error updating pickup location:', error);
            toast.error('Hiba történt az átvételi pont mentése során');
        } finally {
            setIsUpdating(false);
        }
    }, [isEditable, orderId, isUpdating, pickuplocations?.locations, onRefreshOrder]);

    return (
        <>
            <CardHeader
                title="Szállítási mód"
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                        component="span"
                        sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                    >
                        Szállítás módja
                    </Box>

                    {isEditable ? (
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                                value={selectedShipBy}
                                onChange={(e) => handleShipByChange(e.target.value)}
                                disabled={isUpdating}
                            >
                                <MenuItem value="Házhozszállítás">Házhozszállítás</MenuItem>
                                <MenuItem value="Személyes átvétel">Személyes átvétel</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        selectedShipBy
                    )}
                </Box>

                {selectedShipBy === 'Személyes átvétel' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Átvételi pont
                        </Box>

                        {isEditable ? (
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <Select
                                    value={selectedPickupLocationId || ''}
                                    onChange={(e) => handlePickupLocationChange(e.target.value)}
                                    disabled={isUpdating || pickuplocations?.locationsLoading}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>
                                        Válassz átvételi pontot
                                    </MenuItem>
                                    {pickuplocations?.locations?.map((location) => (
                                        <MenuItem key={location.id} value={location.id.toString()} disabled={location.enabled === false}>
                                            {location.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            selectedPickupLocation?.name || 'Nincs kiválasztva'
                        )}
                    </Box>
                )}
            </Stack>

            {selectedPickupLocation && (
                <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                            component="span"
                            sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                        >
                            Cím
                        </Box>

                        {selectedPickupLocation?.postcode} {selectedPickupLocation?.city} {selectedPickupLocation?.address}
                    </Box>
                    {selectedPickupLocation?.note && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box
                                component="span"
                                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                            >
                                Megjegyzés
                            </Box>

                            {selectedPickupLocation.note}
                        </Box>
                    )}
                </Stack>
            )}
        </>
    );
}
