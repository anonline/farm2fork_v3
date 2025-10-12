import type { IShippingCostMethod } from 'src/types/shipping-cost';
import type { IOrderCustomer, IOrderDelivery } from 'src/types/order';
import type { ShippingMethod, OrderHistoryEntry } from 'src/types/order-management';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';

import { supabase } from 'src/lib/supabase';
import { useGetAddresses } from 'src/actions/address';
import { useGetDeliveries } from 'src/actions/delivery';
import { getOrderById } from 'src/actions/order-management';
import { useGetPickupLocations } from 'src/actions/pickup-location';
import { useGetShippingCostMethods } from 'src/actions/shipping-cost';

import { toast } from 'src/components/snackbar';

import { formatPhoneNumber } from '../delivery/view/delivery-list-view';

// ----------------------------------------------------------------------

type Props = {
    delivery?: IOrderDelivery;
    isEditable?: boolean;
    orderId?: string;
    customerId?: string;
    onRefreshOrder?: () => void;
    customer:IOrderCustomer;
    deliveryGuyId?: number | null;
    onRefreshPickupLocationTimes?: (openDays: (string | null)[]) => void;
};

export function OrderDetailsDelivery({ delivery, isEditable, orderId, customerId, onRefreshOrder, customer, deliveryGuyId, onRefreshPickupLocationTimes }: Readonly<Props>) {
    const pickuplocations = useGetPickupLocations();
    const { addresses: addressData } = useGetAddresses(customerId);
    const { deliveries } = useGetDeliveries();

    const {methods:storedShippingMethods } = useGetShippingCostMethods();

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

    const calculateShippingCost = useCallback((method: IShippingCostMethod, customerUserType: 'public' | 'vip' | 'company') => {
        let netCost = 0;
        let applyVAT = false;

        // Get net cost based on customer type
        switch (customerUserType) {
            case 'vip':
                netCost = method.netCostVIP || 0;
                applyVAT = method.vatVIP || false;
                break;
            case 'company':
                netCost = method.netCostCompany || 0;
                applyVAT = method.vatCompany || false;
                break;
            default:
                netCost = method.netCostPublic || 0;
                applyVAT = method.vatPublic || false;
                break;
        }

        // Apply VAT if required
        if (applyVAT && netCost > 0) {
            const vatAmount = (netCost * method.vat) / 100;
            return netCost + vatAmount;
        }

        return netCost;
    }, []);

    const updateOrderInDatabase = useCallback(async (
        orderIdParam: string,
        newShippingMethod: ShippingMethod,
        shippingCost: number,
        newDeliveryAddress: any,
        shippingAddress: any,
        historyNote: string,
        userType: 'public' | 'vip' | 'company'
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
            shipping_method: newShippingMethod,
            shipping_cost: shippingCost,
            shipping_address: newDeliveryAddress,
            total: (order.subtotal || 0) 
                + shippingCost 
                + (order.surchargeAmount || 0)
                + (userType === 'company' ? order.vatTotal || 0 : 0)
                - (order.discountTotal || 0),
            history: [...(order.history || []), historyEntry],
            updated_at: new Date().toISOString(),
        };

        if (newShippingMethod.name === 'Házhozszállítás' && shippingAddress) {
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
            // Get current order to determine customer type
            const { order } = await getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Get customer user type - default to 'public' since we don't have direct access to customer type
            
            const customerUserType: 'public' | 'vip' | 'company' = customer.userType || 'public';
            
            // Find the appropriate shipping method from stored methods
            const storedMethod = storedShippingMethods
                .filter(s => {
                    switch (customerUserType) {
                        case 'vip':
                            return s.enabledVIP;
                        case 'company':
                            return s.enabledCompany;
                        default:
                            return s.enabledPublic;
                    }
                })
                .filter(s => order?.subtotal >= (s.minNetPrice || 0) && order?.subtotal <= (s.maxNetPrice || Infinity))
                .find(method => method.name === newShipBy);
            
            if (!storedMethod) {
                toast.error(`Szállítási mód "${newShipBy}" nem alkalmazható. Elértük a minimális rendelési értéket?`);

                throw new Error(`Szállítási mód "${newShipBy}" nem alkalmazható. Elértük a minimális rendelési értéket?`);
            }

            // Calculate shipping cost based on customer type
            const shippingCost = calculateShippingCost(storedMethod, customerUserType);
            
            // Create the ShippingMethod object
            const newShippingMethod: ShippingMethod = {
                id: storedMethod.id,
                name: storedMethod.name,
                cost: shippingCost,
                description: '',
            };

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

            const historyNote = `Szállítási mód módosítva: ${delivery?.shipBy || 'nincs megadva'} → ${newShipBy} (${shippingCost} Ft)`;

            await updateOrderInDatabase(orderId, newShippingMethod, shippingCost, newDeliveryAddress, shippingAddress, historyNote, customerUserType);
            updateLocalStorage(orderId, newShipBy, newDeliveryAddress, shippingAddress);

            toast.success(`Szállítási mód sikeresen frissítve! Új költség: ${Math.round(shippingCost)} Ft`);
            onRefreshOrder?.();
        } catch (error) {
            console.error('Error updating delivery method:', error);
            toast.error('Hiba történt a szállítási mód mentése során');
            setSelectedShipBy(delivery?.shipBy || 'Házhozszállítás'); // Revert
        } finally {
            setIsUpdating(false);
        }
    }, [isEditable, orderId, isUpdating, selectedPickupLocationId, pickuplocations?.locations, addressData?.shippingAddresses, delivery?.shipBy, onRefreshOrder, createShippingAddressFromDefault, updateOrderInDatabase, updateLocalStorage, storedShippingMethods, calculateShippingCost]);

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
            
            // Get phone and company from customer's default/first address
            const defaultShippingAddress = addressData?.shippingAddresses?.find((addr: any) => addr.isDefault) || 
                                         addressData?.shippingAddresses?.[0];
            const defaultBillingAddress = addressData?.billingAddresses?.find((addr: any) => addr.isDefault) || 
                                        addressData?.billingAddresses?.[0];
            
            const customerPhone = defaultShippingAddress?.phone || defaultBillingAddress?.phone || '';
            const customerCompany = defaultShippingAddress?.companyName || defaultBillingAddress?.companyName || '';
            console.log('customer addresses', addressData);
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
                phoneNumber: customerPhone,
                company: customerCompany,
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


            //Collect open days
            let pickupLocationOpenDays = [
                selectedLocation?.monday || 'zárva',
                selectedLocation?.tuesday || 'zárva',
                selectedLocation?.wednesday || 'zárva',
                selectedLocation?.thursday || 'zárva',
                selectedLocation?.friday || 'zárva',
                selectedLocation?.saturday || 'zárva',
                selectedLocation?.sunday || 'zárva',
            ];
            onRefreshPickupLocationTimes?.(pickupLocationOpenDays);

            toast.success('Átvételi pont sikeresen frissítve!');
            onRefreshOrder?.();
        } catch (error) {
            console.error('Error updating pickup location:', error);
            toast.error('Hiba történt az átvételi pont mentése során');
        } finally {
            setIsUpdating(false);
        }
    }, [isEditable, orderId, isUpdating, pickuplocations?.locations, onRefreshOrder]);

    const selectedDeliveryGuy = deliveries.find((d) => d.id === deliveryGuyId);

    return (
        <>
            <CardHeader
                title="Szállítási mód"
            />
            <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
                {selectedDeliveryGuy && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box
                                component="span"
                                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                            >
                                Futár
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Box sx={{ fontWeight: 'medium' }}>{selectedDeliveryGuy.name}</Box>
                                <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                    {formatPhoneNumber(selectedDeliveryGuy.phone) || 'N/A'}
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 0.5 }} />
                    </>
                )}
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
