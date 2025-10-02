'use client';

import type { IAddressItem } from 'src/types/common';
import type { IOrderCustomer } from 'src/types/order';
import type { ICreateOrderData } from 'src/types/order-management';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { useGetAddresses } from 'src/actions/address';
import { DashboardContent } from 'src/layouts/dashboard';
import { createOrder } from 'src/actions/order-management';
import { useGetPaymentMethods } from 'src/actions/payment-method';
import { useGetPickupLocations } from 'src/actions/pickup-location';
import { useGetShippingCostMethods } from 'src/actions/shipping-cost';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomerSelectionModal } from 'src/components/customer-selection-modal';

// ----------------------------------------------------------------------

export function OrderCreateView() {
    const router = useRouter();
    const [customerModalOpen, setCustomerModalOpen] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<IOrderCustomer | null>(null);
    const [note, setNote] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    // Shipping and payment states
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null);
    const [selectedPickupLocation, setSelectedPickupLocation] = useState<number | null>(null);
    const [selectedShippingAddressIndex, setSelectedShippingAddressIndex] = useState<number | null>(null);
    const [selectedBillingAddressIndex, setSelectedBillingAddressIndex] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
    const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null);

    // Data hooks
    const { methods: paymentMethods } = useGetPaymentMethods();
    const { locations: pickupLocations } = useGetPickupLocations();
    const { methods: shippingMethods } = useGetShippingCostMethods();
    const { addresses: addressData } = useGetAddresses(selectedCustomer?.id);
    const { shipments, setOrderToShipment } = useShipments();

    const handleCustomerSelect = useCallback((customer: IOrderCustomer) => {
        setSelectedCustomer(customer);
        setCustomerModalOpen(false);
        // Reset selections when customer changes
        setSelectedShippingMethod(null);
        setSelectedPickupLocation(null);
        setSelectedShippingAddressIndex(null);
        setSelectedBillingAddressIndex(null);
        setSelectedShipmentId(null);
    }, []);

    // Set default shipping address when addresses load
    useEffect(() => {
        if (addressData?.shippingAddresses && addressData.shippingAddresses.length > 0 && selectedShippingAddressIndex === null) {
            const defaultIndex = addressData.shippingAddresses.findIndex(addr => addr.isDefault);
            setSelectedShippingAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
        }
        if (addressData?.billingAddresses && addressData.billingAddresses.length > 0 && selectedBillingAddressIndex === null) {
            const defaultIndex = addressData.billingAddresses.findIndex(addr => addr.isDefault);
            setSelectedBillingAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
        }
    }, [addressData, selectedShippingAddressIndex, selectedBillingAddressIndex]);

    // Set default payment method when payment methods load
    useEffect(() => {
        if (paymentMethods && paymentMethods.length > 0 && selectedPaymentMethod === null) {
            setSelectedPaymentMethod(paymentMethods[0].id);
        }
    }, [paymentMethods, selectedPaymentMethod]);

    // Get available shipping methods for customer type
    const availableShippingMethods = shippingMethods.filter(method => {
        const userType = selectedCustomer?.userType || 'public';
        switch (userType) {
            case 'vip':
                return method.enabledVIP;
            case 'company':
                return method.enabledCompany;
            default:
                return method.enabledPublic;
        }
    }).filter(method => method.name !== 'Házhozszállítás');

    // Check if method is personal pickup
    const isPersonalPickup = (methodId: number) => {
        const method = shippingMethods.find(m => m.id === methodId);
        return method?.name === 'Személyes átvétel';
    };

    // Handle shipping method change
    const handleShippingMethodChange = useCallback((methodId: number) => {
        setSelectedShippingMethod(methodId);
        if (isPersonalPickup(methodId)) {
            // Reset shipping address, set first pickup location
            setSelectedShippingAddressIndex(null);
            if (pickupLocations && pickupLocations.length > 0) {
                setSelectedPickupLocation(pickupLocations[0].id);
            }
        } else {
            // Reset pickup location
            setSelectedPickupLocation(null);
        }
    }, [pickupLocations, shippingMethods, isPersonalPickup]);

    const handleCreateOrder = useCallback(async () => {
        if (!selectedCustomer) {
            toast.error('Kérjük válasszon vásárlót');
            return;
        }

        if (!selectedShippingMethod) {
            toast.error('Kérjük válasszon szállítási módot');
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error('Kérjük válasszon fizetési módot');
            return;
        }

        if (!selectedShipmentId) {
            toast.error('Kérjük válasszon szállítási dátumot');
            return;
        }

        // Build addresses
        let shippingAddress: IAddressItem | null = null;
        let billingAddress: IAddressItem | null = null;

        if (isPersonalPickup(selectedShippingMethod) && selectedPickupLocation) {
            const location = pickupLocations.find(loc => loc.id === selectedPickupLocation);
            if (location) {
                shippingAddress = {
                    id: location.id.toString(),
                    addressType: 'pickup',
                    primary: false,
                    name: selectedCustomer.name,
                    postcode: location.postcode || '',
                    city: location.city || '',
                    street: location.address || '',
                    floor: '',
                    houseNumber: '',
                    doorbell: '',
                    note: location.note || '',
                    fullAddress: `${location.postcode} ${location.city}, ${location.address}`,
                    phoneNumber: '',
                    company: selectedCustomer.userType === 'company' ? selectedCustomer.name : '',
                };
            }
        } else if (selectedShippingAddressIndex !== null && addressData?.shippingAddresses) {
            const addr = addressData.shippingAddresses[selectedShippingAddressIndex];
            if (addr) {
                shippingAddress = {
                    addressType: 'shipping',
                    primary: addr.isDefault || false,
                    name: addr.fullName || selectedCustomer.name,
                    postcode: addr.postcode || '',
                    city: addr.city || '',
                    street: addr.street || '',
                    floor: addr.floor || '',
                    houseNumber: addr.houseNumber || '',
                    doorbell: addr.doorbell || '',
                    note: addr.comment || '',
                    fullAddress: `${addr.postcode || ''} ${addr.city || ''}, ${addr.street || ''} ${addr.houseNumber || ''}`,
                    phoneNumber: addr.phone || '',
                    company: '',
                };
            }
        }

        if (selectedBillingAddressIndex !== null && addressData?.billingAddresses) {
            const addr = addressData.billingAddresses[selectedBillingAddressIndex];
            if (addr) {
                billingAddress = {
                    addressType: 'billing',
                    primary: addr.isDefault || false,
                    name: addr.fullName || selectedCustomer.name,
                    postcode: addr.postcode || '',
                    city: addr.city || '',
                    street: addr.street || '',
                    floor: '', // IBillingAddress doesn't have floor
                    houseNumber: addr.houseNumber || '',
                    doorbell: '', // IBillingAddress doesn't have doorbell
                    note: addr.comment || '',
                    fullAddress: `${addr.postcode || ''} ${addr.city || ''}, ${addr.street || ''} ${addr.houseNumber || ''}`,
                    phoneNumber: addr.phone || '',
                    company: addr.companyName || '',
                    email: addr.email || selectedCustomer.email,
                    taxNumber: addr.taxNumber || '',
                };
            }
        }

        if (!shippingAddress) {
            toast.error('Kérjük válasszon szállítási címet');
            return;
        }

        if (!billingAddress) {
            toast.error('Kérjük válasszon számlázási címet');
            return;
        }

        const selectedShippingMethodData = shippingMethods.find(m => m.id === selectedShippingMethod);
        const selectedPaymentMethodData = paymentMethods.find(m => m.id === selectedPaymentMethod);
        const selectedShipmentData = shipments.find(s => s.id === selectedShipmentId);

        if (!selectedShippingMethodData || !selectedPaymentMethodData) {
            toast.error('Érvénytelen szállítási vagy fizetési mód');
            return;
        }

        if (!selectedShipmentData) {
            toast.error('Érvénytelen szállítási dátum');
            return;
        }

        const orderData: ICreateOrderData = {
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            billingEmails: [selectedCustomer.email],
            notifyEmails: [selectedCustomer.email],
            note: note.trim() || '',
            shippingAddress,
            billingAddress,
            denyInvoice: selectedCustomer.userType === 'vip',
            needVAT: selectedCustomer.userType !== 'vip',
            surchargeAmount: 0,
            items: [], // Will be added later
            subtotal: 0,
            shippingCost: 0, // Calculate based on method
            vatTotal: 0,
            discountTotal: 0,
            total: 0,
            shippingMethod: {
                id: selectedShippingMethodData.id,
                name: selectedShippingMethodData.name,
                description: '',
                cost: 0, // Will be calculated
            },
            paymentMethod: selectedPaymentMethodData,
            paymentDueDays: 30,
            plannedShippingDateTime: fDate(selectedShipmentData.date)
        };

        setIsCreating(true);
        try {
            const { orderId: newOrderId, error: newOrderError } = await createOrder(orderData);
            
            if (newOrderId) {

                setOrderToShipment(newOrderId, selectedShipmentId).catch(err => {
                    console.error('Error assigning order to shipment:', err);
                    toast.error('A rendelés létrehozása sikeres volt, de a szállítmányhoz rendelés sikertelen.');
                });

                toast.success('Új rendelés létrehozva.');
                router.push(paths.dashboard.order.details(newOrderId));
                return;
            }

            toast.error(`Hiba történt az új rendelés létrehozásakor. ${newOrderError}`);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Hiba történt az új rendelés létrehozásakor.');
        } finally {
            setIsCreating(false);
        }
    }, [
        selectedCustomer,
        selectedShippingMethod,
        selectedPaymentMethod,
        selectedPickupLocation,
        selectedShippingAddressIndex,
        selectedBillingAddressIndex,
        note,
        shippingMethods,
        paymentMethods,
        pickupLocations,
        addressData,
        router,
        isPersonalPickup,
        shipments,
        selectedShipmentId,
    ]);

    const handleCustomerChange = useCallback(() => {
        setCustomerModalOpen(true);
    }, [setCustomerModalOpen]);

    const handleCancel = useCallback(() => {
        if(selectedCustomer) {
            if(confirm('Biztosan el akarja vetni a létrehozott rendelést?')) {
                router.push(paths.dashboard.order.root);
            }
        }
    }, [router, selectedCustomer]);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Új rendelés létrehozása"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Rendelések', href: paths.dashboard.order.root },
                    { name: 'Új rendelés' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            {!selectedCustomer ? (
                <Card sx={{ p: 5, textAlign: 'center' }}>
                    <Iconify icon="solar:user-rounded-bold" width={48} sx={{ mb: 2, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Válasszon vásárlót
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        A rendelés létrehozásához először válasszon ki egy vásárlót
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={() => setCustomerModalOpen(true)}
                    >
                        Vásárló kiválasztása
                    </Button>
                </Card>
            ) : (
                <Stack spacing={3}>
                    {/* Customer Info Card */}
                    <Card>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="overline" color="text.secondary">
                                        Kiválasztott vásárló
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                                        <Box>
                                            <Typography variant="h6">{selectedCustomer.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedCustomer.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Típus:{' '}
                                                {selectedCustomer.userType === 'public' && 'Magánszemély'}
                                                {selectedCustomer.userType === 'vip' && 'VIP'}
                                                {selectedCustomer.userType === 'company' && 'Céges'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:pen-bold" />}
                                    onClick={handleCustomerChange}
                                >
                                    Módosítás
                                </Button>
                            </Stack>
                        </Box>
                    </Card>

                    {/* Shipping Method Selection */}
                    <Card>
                        <CardHeader title="Szállítási mód" />
                        <Box sx={{ p: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Válasszon szállítási módot</InputLabel>
                                <Select
                                    value={selectedShippingMethod || ''}
                                    label="Válasszon szállítási módot"
                                    onChange={(e) => handleShippingMethodChange(Number(e.target.value))}
                                >
                                    {availableShippingMethods.map((method) => (
                                        <MenuItem key={method.id} value={method.id}>
                                            {method.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Pickup Location Selection */}
                            {selectedShippingMethod && isPersonalPickup(selectedShippingMethod) && (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Átvételi pont</InputLabel>
                                    <Select
                                        value={selectedPickupLocation || ''}
                                        label="Átvételi pont"
                                        onChange={(e) => setSelectedPickupLocation(Number(e.target.value))}
                                    >
                                        {pickupLocations.map((location) => (
                                            <MenuItem key={location.id} value={location.id} disabled={!location.enabled}>
                                                {location.name} - {location.city}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {/* Shipping Address Selection */}
                            {selectedShippingMethod && !isPersonalPickup(selectedShippingMethod) && addressData?.shippingAddresses && (
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Szállítási cím</InputLabel>
                                    <Select
                                        value={selectedShippingAddressIndex ?? ''}
                                        label="Szállítási cím"
                                        onChange={(e) => setSelectedShippingAddressIndex(Number(e.target.value))}
                                    >
                                        {addressData.shippingAddresses.map((address, index) => (
                                            <MenuItem key={address.id || `shipping-${index}`} value={index}>
                                                {address.fullName} - {address.postcode} {address.city}, {address.street} {address.houseNumber}
                                                {address.isDefault && ' (Alapértelmezett)'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    </Card>

                    {/* Shipment Date Selection */}
                    <Card>
                        <CardHeader title="Szállítási dátum és idő" />
                        <Box sx={{ p: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Válasszon szállítási dátumot</InputLabel>
                                <Select
                                    value={selectedShipmentId || ''}
                                    label="Válasszon szállítási dátumot"
                                    onChange={(e) => setSelectedShipmentId(Number(e.target.value))}
                                >
                                    {shipments.map((shipment) => (
                                        <MenuItem key={shipment.id} value={shipment.id}>
                                            {new Date(shipment.date).toLocaleDateString('hu-HU', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric',
                                                weekday: 'long'
                                            })}
                                            {' - '}
                                            {shipment.orderCount} rendelés
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Card>

                    {/* Billing Address Selection */}
                    {addressData?.billingAddresses && (
                        <Card>
                            <CardHeader title="Számlázási cím" />
                            <Box sx={{ p: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Számlázási cím</InputLabel>
                                    <Select
                                        value={selectedBillingAddressIndex ?? ''}
                                        label="Számlázási cím"
                                        onChange={(e) => setSelectedBillingAddressIndex(Number(e.target.value))}
                                    >
                                        {addressData.billingAddresses.map((address, index) => (
                                            <MenuItem key={address.id || `billing-${index}`} value={index}>
                                                {address.fullName || address.companyName} - {address.postcode} {address.city}, {address.street} {address.houseNumber}
                                                {address.isDefault && ' (Alapértelmezett)'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Card>
                    )}

                    {/* Payment Method Selection */}
                    <Card>
                        <CardHeader title="Fizetési mód" />
                        <Box sx={{ p: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Fizetési mód</InputLabel>
                                <Select
                                    value={selectedPaymentMethod || ''}
                                    label="Fizetési mód"
                                    onChange={(e) => setSelectedPaymentMethod(Number(e.target.value))}
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method.id} value={method.id}>
                                            {method.name}
                                            {method.additionalCost > 0 && ` (+${method.additionalCost} Ft)`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Card>

                    {/* Order Note */}
                    <Card>
                        <CardHeader title="Megjegyzés" />
                        <Box sx={{ p: 3 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Rendelési megjegyzés"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Opcionális megjegyzés a rendeléshez..."
                            />
                        </Box>
                    </Card>

                    {/* Action Buttons */}
                    <Card sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={handleCancel} disabled={isCreating}>
                                Mégse
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleCreateOrder}
                                disabled={isCreating || !selectedCustomer || !selectedShippingMethod || !selectedPaymentMethod || !selectedShipmentId}
                            >
                                {isCreating ? 'Létrehozás...' : 'Rendelés létrehozása'}
                            </Button>
                        </Stack>
                    </Card>
                </Stack>
            )}

            {/* Customer Selection Modal */}
            <CustomerSelectionModal
                open={customerModalOpen}
                onClose={() => {

                    setCustomerModalOpen(false);
                }}
                onSelectCustomer={handleCustomerSelect}
                currentCustomerId={selectedCustomer?.id}
            />
        </DashboardContent>
    );
}
