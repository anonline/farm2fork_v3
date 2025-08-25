import type {
    ICheckoutCardOption,
    ICheckoutPaymentOption,
    ICheckoutDeliveryOption,
} from 'src/types/checkout';
import type { IPickupLocation } from 'src/types/pickup-location';
import type { IShippingCostMethod } from 'src/types/shipping-cost';
import type { IAddressItem } from 'src/types/common';
import type { IPaymentMethod } from 'src/types/payment-method';

import { z as zod } from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { useGetPickupLocations } from 'src/actions/pickup-location';
import { useGetShippingCostMethods } from 'src/actions/shipping-cost';
import { useGetCustomerData } from 'src/actions/customer';
import { useGetPaymentMethods } from 'src/actions/payment-method';
import { PickupLocationSelector, DeliveryAddressSelector, EmailNotificationSelector, DeliveryCommentSelector, DeliveryTimeSelector } from './components';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';
import { Link } from '@mui/material';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export type PaymentSchemaType = zod.infer<typeof PaymentSchema>;

export const PaymentSchema = zod.object({
    payment: zod.number().min(1, { message: 'Payment method is required!' }),
    shippingMethod: zod.number().min(1, { message: 'Shipping method is required!' }),
    pickupLocation: zod.number().optional(),
    deliveryAddressIndex: zod.number().optional(),
    notificationEmails: zod.array(zod.string().email()).optional(),
}).refine((data) => {
    // If delivery type is personal pickup, pickup location is required
    // We need to check if the shipping method is "Személyes átvétel" (personal pickup)
    // This will be validated in the component where we have access to shipping methods
    return true;
}, {
    message: 'Pickup location is required for personal pickup!',
    path: ['pickupLocation'],
});

// ----------------------------------------------------------------------

export function CheckoutPayment() {
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null);
    const [selectedPickupLocation, setSelectedPickupLocation] = useState<number | null>(null);
    const [selectedDeliveryAddressIndex, setSelectedDeliveryAddressIndex] = useState<number | null>(null);
    const [deliveryAccordionExpanded, setDeliveryAccordionExpanded] = useState(true);
    const [deliveryTimeAccordionExpanded, setDeliveryTimeAccordionExpanded] = useState(false);
    const [paymentAccordionExpanded, setPaymentAccordionExpanded] = useState(false);
    const [hasShippingZoneError, setHasShippingZoneError] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [dataTransferAccepted, setDataTransferAccepted] = useState(false);

    const { user, authenticated } = useAuthContext();
    const { locations: pickupLocations } = useGetPickupLocations();
    const { methods: shippingMethods } = useGetShippingCostMethods();
    const { methods: paymentMethods } = useGetPaymentMethods();
    const { customerData } = useGetCustomerData(user?.id);

    const {
        loading,
        onResetCart,
        onChangeStep,
        onApplyShipping,
        onCreateDeliveryAddress,
        onUpdateNotificationEmails,
        onUpdateDeliveryComment,
        onUpdateDeliveryDateTime,
        onResetDeliveryDateTime,
        onUpdatePaymentMethod,
        state: checkoutState,
    } = useCheckoutContext();

    // Determine user type for shipping methods
    const getUserType = useMemo(() => {
        if (!authenticated) return 'public';
        if (user?.user_metadata?.is_admin) return 'public';
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    }, [authenticated, user?.user_metadata]);

    // Filter shipping methods based on user type and cart value
    const availableShippingMethods = useMemo(() => {
        const userType = getUserType;
        return shippingMethods.filter((method) => {
            // Check if method is enabled for user type
            let enabled = false;
            switch (userType) {
                case 'vip':
                    enabled = method.enabledVIP;
                    break;
                case 'company':
                    enabled = method.enabledCompany;
                    break;
                default:
                    enabled = method.enabledPublic;
                    break;
            }

            if (!enabled) return false;

            // Check if cart subtotal is within min/max range
            const subtotal = checkoutState.subtotal + checkoutState.surcharge;

            // If minNetPrice is set and subtotal is below minimum, exclude this method
            if (method.minNetPrice > 0 && subtotal < method.minNetPrice) {
                return false;
            }

            // If maxNetPrice is set and subtotal is above maximum, exclude this method
            if (method.maxNetPrice > 0 && subtotal > method.maxNetPrice) {
                return false;
            }

            return true;
        });
    }, [shippingMethods, getUserType, checkoutState.subtotal]);

    // Filter payment methods based on user type
    const availablePaymentMethods = useMemo(() => {
        const userType = getUserType;
        return paymentMethods.filter((method) => {
            // Check if method is enabled for user type
            switch (userType) {
                case 'vip':
                    return method.enableVIP;
                case 'company':
                    return method.enableCompany;
                default:
                    return method.enablePublic;
            }
        });
    }, [paymentMethods, getUserType]);

    // Get cost for current user type
    const getMethodCost = useMemo(() => {
        return (method: IShippingCostMethod) => {
            const userType = getUserType;
            switch (userType) {
                case 'vip':
                    return method.netCostVIP;
                case 'company':
                    return method.netCostCompany;
                default:
                    return method.netCostPublic;
            }
        };
    }, [getUserType]);

    // Check if VAT should be applied for current user type
    const shouldApplyVAT = useMemo(() => {
        return (method: IShippingCostMethod) => {
            const userType = getUserType;
            switch (userType) {
                case 'vip':
                    return method.vatVIP;
                case 'company':
                    return method.vatCompany;
                default:
                    return method.vatPublic;
            }
        };
    }, [getUserType]);

    // Get total cost including VAT if applicable
    const getTotalMethodCost = useMemo(() => {
        return (method: IShippingCostMethod) => {
            const netCost = getMethodCost(method);
            const applyVAT = shouldApplyVAT(method);

            if (applyVAT && netCost > 0) {
                const vatAmount = (netCost * method.vat) / 100;
                return netCost + vatAmount;
            }

            return netCost;
        };
    }, [getMethodCost, shouldApplyVAT]);

    // Format method display name with total cost (including VAT)
    const formatMethodLabel = useMemo(() => {
        return (method: IShippingCostMethod) => {
            const totalCost = getTotalMethodCost(method);

            // Add range information if min/max limits are set
            let rangeInfo = '';
            if (method.minNetPrice > 0 && method.maxNetPrice > 0) {
                rangeInfo = ` (${method.minNetPrice}-${method.maxNetPrice} Ft között)`;
            } else if (method.minNetPrice > 0) {
                rangeInfo = ` (${method.minNetPrice} Ft felett)`;
            } else if (method.maxNetPrice > 0) {
                rangeInfo = ` (${method.maxNetPrice} Ft alatt)`;
            }

            const costLabel = totalCost === 0 ? 'Ingyenes' : `${Math.round(totalCost)} Ft`;
            return `${method.name} - ${costLabel}`;
        };
    }, [getTotalMethodCost]);

    // Check if method is personal pickup
    const isPersonalPickup = useMemo(() => {
        return (methodId: number) => {
            const method = shippingMethods.find(m => m.id === methodId);
            return method?.name === 'Személyes átvétel';
        };
    }, [shippingMethods]);

    // Check if method is home delivery
    const isHomeDelivery = useMemo(() => {
        return (methodId: number) => {
            const method = shippingMethods.find(m => m.id === methodId);
            return method?.name === 'Házhozszállítás';
        };
    }, [shippingMethods]);

    // Check if delivery details are complete
    const isDeliveryDetailsComplete = useMemo(() => {
        if (!selectedShippingMethod) return false;

        const hasNotificationEmail = checkoutState.notificationEmails && checkoutState.notificationEmails.length > 0;
        if (!hasNotificationEmail) return false;

        if (isPersonalPickup(selectedShippingMethod)) {
            return selectedPickupLocation !== null;
        }

        if (isHomeDelivery(selectedShippingMethod)) {
            // For home delivery, also check that there's no shipping zone error
            return selectedDeliveryAddressIndex !== null && !hasShippingZoneError;
        }

        return false;
    }, [selectedShippingMethod, selectedPickupLocation, selectedDeliveryAddressIndex, checkoutState.notificationEmails, isPersonalPickup, isHomeDelivery, hasShippingZoneError]);

    // Check if all order requirements are complete
    const isOrderComplete = useMemo(() => {
        // Must have delivery details complete
        if (!isDeliveryDetailsComplete) return false;

        // Must have delivery date/time selected
        if (!checkoutState.selectedDeliveryDateTime) return false;

        // Must have payment method selected
        if (!checkoutState.selectedPaymentMethod) return false;

        // Must accept terms
        if (!termsAccepted) return false;

        // If simple payment method, must accept data transfer
        if (checkoutState.selectedPaymentMethod?.slug === 'simple' && !dataTransferAccepted) return false;

        return true;
    }, [isDeliveryDetailsComplete, checkoutState.selectedDeliveryDateTime, checkoutState.selectedPaymentMethod, termsAccepted, dataTransferAccepted]);

    // Format delivery date/time for display
    const formatDeliveryDisplay = useMemo(() => {
        if (!checkoutState.selectedDeliveryDateTime) return '';

        try {
            const date = new Date(checkoutState.selectedDeliveryDateTime);
            const formattedDate = date.toLocaleDateString('hu-HU');
            const timeRange = selectedShippingMethod && isPersonalPickup(selectedShippingMethod)
                ? '06:00-19:00' // Default pickup hours
                : '06:00-19:00'; // Default delivery hours
            return `${formattedDate}`;
        } catch {
            return '';
        }
    }, [checkoutState.selectedDeliveryDateTime, selectedShippingMethod, isPersonalPickup]);

    const defaultValues: PaymentSchemaType = {
        payment: 0,
        shippingMethod: selectedShippingMethod || 0,
        pickupLocation: selectedPickupLocation || undefined,
        deliveryAddressIndex: selectedDeliveryAddressIndex || undefined,
        notificationEmails: checkoutState.notificationEmails,
    };

    const methods = useForm<PaymentSchemaType>({
        resolver: zodResolver(PaymentSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        setValue,
        control,
        formState: { isSubmitting },
        setError,
        clearErrors,
    } = methods;

    const handleShippingMethodChange = (event: React.MouseEvent<HTMLElement>, newMethodId: string | null) => {
        if (newMethodId !== null) {
            const methodId = parseInt(newMethodId, 10);
            const selectedMethod = shippingMethods.find(m => m.id === methodId);

            if (selectedMethod) {
                setSelectedShippingMethod(methodId);
                setValue('shippingMethod', methodId);

                // Apply shipping cost including VAT
                const totalCost = getTotalMethodCost(selectedMethod);
                onApplyShipping(totalCost);

                // Reset selections when switching between different method types
                if (selectedShippingMethod) {
                    const wasPersonalPickup = isPersonalPickup(selectedShippingMethod);
                    const wasHomeDelivery = isHomeDelivery(selectedShippingMethod);
                    const isNowPersonalPickup = isPersonalPickup(methodId);
                    const isNowHomeDelivery = isHomeDelivery(methodId);

                    // Reset pickup location when switching from personal pickup
                    if (wasPersonalPickup && !isNowPersonalPickup) {
                        setSelectedPickupLocation(null);
                        setValue('pickupLocation', undefined);
                    }

                    // Reset delivery address when switching from home delivery
                    if (wasHomeDelivery && !isNowHomeDelivery) {
                        setSelectedDeliveryAddressIndex(null);
                        setValue('deliveryAddressIndex', undefined);
                    }
                }

                // Set defaults for new method type
                if (isPersonalPickup(methodId)) {
                    // Set default pickup location (Farm2Fork raktár) when switching to pickup
                    const defaultPickup = pickupLocations.find(loc => loc.enabled && loc.name.includes('Farm2Fork'));
                    if (defaultPickup) {
                        setSelectedPickupLocation(defaultPickup.id);
                        setValue('pickupLocation', defaultPickup.id);
                    }
                } else if (isHomeDelivery(methodId) && customerData?.deliveryAddress?.length) {
                    // Set first delivery address as default for home delivery
                    setSelectedDeliveryAddressIndex(0);
                    setValue('deliveryAddressIndex', 0);
                }
            }
        }
    };

    const handlePickupLocationChange = (locationId: number) => {
        setSelectedPickupLocation(locationId);
        setValue('pickupLocation', locationId);
    };

    const updateDeliveryAddressInContext = (index: number) => {
        if (customerData?.deliveryAddress?.[index]) {
            const selectedAddress = customerData.deliveryAddress[index];
            const addressItem: IAddressItem = {
                name: selectedAddress.fullName,
                fullAddress: `${selectedAddress.zipCode} ${selectedAddress.city}, ${selectedAddress.streetAddress}${selectedAddress.floorDoor ? `, ${selectedAddress.floorDoor}` : ''
                    }`,
                phoneNumber: selectedAddress.phone,
                addressType: 'delivery',
            };
            onCreateDeliveryAddress(addressItem);
        }
    };

    const handleDeliveryAddressChange = (index: number) => {
        setSelectedDeliveryAddressIndex(index);
        setValue('deliveryAddressIndex', index);
        updateDeliveryAddressInContext(index);
    };

    const handleShippingZoneError = (hasError: boolean) => {
        setHasShippingZoneError(hasError);
    };

    const handleNotificationEmailsChange = (emails: string[]) => {
        onUpdateNotificationEmails(emails);
        setValue('notificationEmails', emails);
    };

    const handleDeliveryCommentChange = (comment: string) => {
        onUpdateDeliveryComment(comment);
    };

    const handleContinueToDeliveryTime = () => {
        setDeliveryAccordionExpanded(false);
        setDeliveryTimeAccordionExpanded(true);
        setPaymentAccordionExpanded(false);
    };

    const handleContinueToPayment = () => {
        setDeliveryAccordionExpanded(false);
        setDeliveryTimeAccordionExpanded(false);
        setPaymentAccordionExpanded(true);
    };

    // Initialize default shipping method and related selections when data is loaded
    useEffect(() => {
        if (availableShippingMethods.length > 0 && !selectedShippingMethod) {
            // Set first available method as default
            const defaultMethod = availableShippingMethods[0];
            setSelectedShippingMethod(defaultMethod.id);
            setValue('shippingMethod', defaultMethod.id);

            // Apply shipping cost for default method including VAT
            const totalCost = getTotalMethodCost(defaultMethod);
            onApplyShipping(totalCost);

            // If it's personal pickup, set default pickup location
            if (isPersonalPickup(defaultMethod.id)) {
                const defaultPickup = pickupLocations.find(loc => loc.enabled && loc.name.includes('Farm2Fork'));
                if (defaultPickup) {
                    setSelectedPickupLocation(defaultPickup.id);
                    setValue('pickupLocation', defaultPickup.id);
                }
            }
            // If it's home delivery, set default delivery address
            else if (isHomeDelivery(defaultMethod.id) && customerData?.deliveryAddress?.length) {
                setSelectedDeliveryAddressIndex(0);
                setValue('deliveryAddressIndex', 0);
                // Update checkout context with first delivery address
                handleDeliveryAddressChange(0);
            }
        }
    }, [availableShippingMethods, selectedShippingMethod, setValue, isPersonalPickup, isHomeDelivery, pickupLocations, customerData?.deliveryAddress, getTotalMethodCost, onApplyShipping]);

    // Recalculate available methods and costs when cart subtotal changes
    useEffect(() => {
        // If current selected method is no longer available, select a new one
        if (selectedShippingMethod && !availableShippingMethods.find(m => m.id === selectedShippingMethod)) {
            if (availableShippingMethods.length > 0) {
                const newMethod = availableShippingMethods[0];
                setSelectedShippingMethod(newMethod.id);
                setValue('shippingMethod', newMethod.id);

                const totalCost = getTotalMethodCost(newMethod);
                onApplyShipping(totalCost);

                // Handle pickup location for new method
                if (isPersonalPickup(newMethod.id)) {
                    const defaultPickup = pickupLocations.find(loc => loc.enabled && loc.name.includes('Farm2Fork'));
                    if (defaultPickup) {
                        setSelectedPickupLocation(defaultPickup.id);
                        setValue('pickupLocation', defaultPickup.id);
                    }
                    // Reset delivery address
                    setSelectedDeliveryAddressIndex(null);
                    setValue('deliveryAddressIndex', undefined);
                } else if (isHomeDelivery(newMethod.id) && customerData?.deliveryAddress?.length) {
                    // Set default delivery address
                    setSelectedDeliveryAddressIndex(0);
                    setValue('deliveryAddressIndex', 0);
                    // Reset pickup location
                    setSelectedPickupLocation(null);
                    setValue('pickupLocation', undefined);
                } else {
                    // Reset both
                    setSelectedPickupLocation(null);
                    setValue('pickupLocation', undefined);
                    setSelectedDeliveryAddressIndex(null);
                    setValue('deliveryAddressIndex', undefined);
                }
            } else {
                // No methods available
                setSelectedShippingMethod(null);
                setValue('shippingMethod', 0);
                onApplyShipping(0);
                setSelectedPickupLocation(null);
                setValue('pickupLocation', undefined);
                setSelectedDeliveryAddressIndex(null);
                setValue('deliveryAddressIndex', undefined);
            }
        } else if (selectedShippingMethod) {
            // Update cost for current method
            const currentMethod = shippingMethods.find(m => m.id === selectedShippingMethod);
            if (currentMethod) {
                const totalCost = getTotalMethodCost(currentMethod);
                onApplyShipping(totalCost);
            }
        }
    }, [availableShippingMethods, selectedShippingMethod, shippingMethods, getTotalMethodCost, onApplyShipping, setValue, isPersonalPickup, isHomeDelivery, pickupLocations, customerData?.deliveryAddress]);

    // Reset delivery date/time when shipping method, pickup location, or delivery address changes
    useEffect(() => {
        onResetDeliveryDateTime();
    }, [selectedShippingMethod, selectedPickupLocation, selectedDeliveryAddressIndex, onResetDeliveryDateTime]);

    // Initialize default payment method when available payment methods are loaded
    useEffect(() => {
        if (availablePaymentMethods.length > 0 && !checkoutState.selectedPaymentMethod) {
            const defaultPaymentMethod = availablePaymentMethods[0];
            setValue('payment', defaultPaymentMethod.id);
            onUpdatePaymentMethod(defaultPaymentMethod);
        }
    }, [availablePaymentMethods, checkoutState.selectedPaymentMethod, setValue, onUpdatePaymentMethod]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            // Validate terms acceptance
            if (!termsAccepted) {
                toast.error('Az Általános Szerződési Feltételek elfogadása kötelező.');
                return;
            }

            // Validate pickup location for personal pickup
            if (data.shippingMethod && isPersonalPickup(data.shippingMethod)) {
                if (!data.pickupLocation) {
                    setError('pickupLocation', {
                        type: 'manual',
                        message: 'Pickup location is required for personal pickup!'
                    });
                    return;
                }
            }

            // Validate delivery address for home delivery
            if (data.shippingMethod && isHomeDelivery(data.shippingMethod)) {
                if (data.deliveryAddressIndex === undefined || data.deliveryAddressIndex === null) {
                    setError('deliveryAddressIndex', {
                        type: 'manual',
                        message: 'Delivery address is required for home delivery!'
                    });
                    return;
                }
            }

            clearErrors(['pickupLocation', 'deliveryAddressIndex']);
            onResetCart();
            onChangeStep('next');
            console.info('DATA', data);
        } catch (error) {
            console.error(error);
        }
    });

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Delivery Type Selection */}
                    <Accordion
                        expanded={deliveryAccordionExpanded}
                        onChange={(event, isExpanded) => setDeliveryAccordionExpanded(isExpanded)}
                        elevation={0}
                        sx={{
                            mb: 3,
                            boxShadow: 'none !important',
                            '&:before': {
                                display: 'none',
                            },
                            '& .MuiAccordionSummary-root': {
                                px: 0,
                                boxShadow: 'none !important',
                            },
                            '& .MuiAccordionDetails-root': {
                                px: 0,
                            },
                            '&.Mui-expanded': {
                                boxShadow: 'none !important',
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            sx={{
                                '& .MuiAccordionSummary-content': {
                                    alignItems: 'center',
                                    gap: 2
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: deliveryAccordionExpanded ? 'primary.main' : 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {deliveryAccordionExpanded ? '1' : '✓'}
                            </Box>
                            <Typography variant="h6" sx={{ color: deliveryAccordionExpanded ? 'text.primary' : 'primary.main' }}>
                                Szállítás részletei
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Kérjük add meg a szállítási adatokat
                                </Typography>
                                <ToggleButtonGroup
                                    value={selectedShippingMethod?.toString() || ''}
                                    exclusive
                                    fullWidth
                                    onChange={handleShippingMethodChange}
                                    sx={{}}
                                >
                                    {availableShippingMethods.map((method) => (
                                        <ToggleButton
                                            key={method.id}
                                            value={method.id.toString()}
                                            sx={{ py: 1.5 }}
                                        >
                                            {formatMethodLabel(method)}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>

                                {/* Pickup Locations Selection */}
                                {selectedShippingMethod && isPersonalPickup(selectedShippingMethod) && (
                                    <PickupLocationSelector
                                        selectedPickupLocation={selectedPickupLocation}
                                        onLocationChange={handlePickupLocationChange}
                                    />
                                )}

                                {/* Delivery Address Selection */}
                                {selectedShippingMethod && isHomeDelivery(selectedShippingMethod) && (
                                    <Box sx={{ mt: 2 }}>
                                        <DeliveryAddressSelector
                                            deliveryAddresses={customerData?.deliveryAddress || []}
                                            selectedAddressIndex={selectedDeliveryAddressIndex}
                                            onAddressChange={handleDeliveryAddressChange}
                                            onEditAddress={(index) => {
                                                // TODO: Implement edit functionality later
                                                console.log('Edit address at index:', index);
                                            }}
                                            onShippingZoneError={handleShippingZoneError}
                                            isHomeDelivery={true}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Email Notification Section */}
                            <EmailNotificationSelector
                                emails={checkoutState.notificationEmails}
                                onEmailsChange={handleNotificationEmailsChange}
                                userEmail={user?.email}
                            />

                            {/* Delivery Comment Section */}
                            <DeliveryCommentSelector
                                comment={checkoutState.deliveryComment}
                                onCommentChange={handleDeliveryCommentChange}
                            />

                            {/* Continue Button */}
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={!isDeliveryDetailsComplete}
                                    onClick={handleContinueToDeliveryTime}
                                    sx={{ py: 1.5 }}
                                >
                                    Kész
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* Delivery Time Selection */}
                    <Accordion
                        expanded={deliveryTimeAccordionExpanded}
                        onChange={(event, isExpanded) => setDeliveryTimeAccordionExpanded(isExpanded)}
                        elevation={0}
                        sx={{
                            mb: 3,
                            boxShadow: 'none !important',
                            '&:before': {
                                display: 'none',
                            },
                            '& .MuiAccordionSummary-root': {
                                px: 0,
                                boxShadow: 'none !important',
                            },
                            '& .MuiAccordionDetails-root': {
                                px: 0,
                            },
                            '&.Mui-expanded': {
                                boxShadow: 'none !important',
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            sx={{
                                '& .MuiAccordionSummary-content': {
                                    alignItems: 'center',
                                    gap: 2
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: deliveryAccordionExpanded ? 'primary.main' : 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {deliveryTimeAccordionExpanded ? '2' : '✓'}
                            </Box>
                            <Typography variant="h6" sx={{ color: deliveryTimeAccordionExpanded ? 'text.primary' : 'primary.main' }}>
                                {selectedShippingMethod && isPersonalPickup(selectedShippingMethod ?? 0) ? 'Átvételi' : 'Kiszállítási'} idő
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" sx={{ mb: 2 }}>Amennyiben a mai napon leadod a rendelésed vagy legkésőbb vasárnap 12:00-ig, akkor az alábbi időpontban szállítjuk a rendelésed.

                            </Typography>
                            <DeliveryTimeSelector
                                isHomeDelivery={selectedShippingMethod ? isHomeDelivery(selectedShippingMethod) : false}
                                zipCode={selectedShippingMethod && isHomeDelivery(selectedShippingMethod) && selectedDeliveryAddressIndex !== null ? (customerData?.deliveryAddress?.[selectedDeliveryAddressIndex]?.zipCode || undefined) : undefined}
                                pickupLocationId={selectedShippingMethod && isPersonalPickup(selectedShippingMethod) ? selectedPickupLocation || undefined : undefined}
                                selectedDateTime={checkoutState.selectedDeliveryDateTime}
                                onDateTimeChange={onUpdateDeliveryDateTime}
                            />

                            {checkoutState.selectedDeliveryDateTime && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleContinueToPayment}
                                        sx={{ minWidth: 100 }}
                                        fullWidth
                                        color='primary'
                                    >
                                        Kész
                                    </Button>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>



                    {/* Payment Method Accordion */}
                    <Accordion
                        expanded={paymentAccordionExpanded}
                        onChange={() => setPaymentAccordionExpanded(!paymentAccordionExpanded)}
                        disabled={!checkoutState.selectedDeliveryDateTime}
                        sx={{
                            mb: 3,
                            boxShadow: 'none !important',
                            '&:before': {
                                display: 'none',
                            },
                            '& .MuiAccordionSummary-root': {
                                px: 0,
                                boxShadow: 'none !important',
                            },
                            '& .MuiAccordionDetails-root': {
                                px: 0,
                            },
                            '&.Mui-expanded': {
                                boxShadow: 'none !important',
                            }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            sx={{
                                '& .MuiAccordionSummary-content': {
                                    alignItems: 'center',
                                    gap: 2
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: paymentAccordionExpanded ? 'primary.main' : 'grey.300',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {paymentAccordionExpanded ? '3' : '✓'}
                            </Box>
                            <Typography variant="h6" sx={{ color: paymentAccordionExpanded ? 'text.primary' : 'grey.600' }}>
                                Fizetési mód
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" sx={{ mb: 3 }}>
                                Válaszd ki a fizetési módot és add meg a számlázási adatokat.
                            </Typography>

                            {/* Payment Methods */}
                            <Controller
                                name="payment"
                                control={control}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <Box sx={{ mb: 3 }}>
                                        <RadioGroup
                                            value={value || ''}
                                            onChange={(e) => {
                                                const methodId = parseInt(e.target.value, 10);
                                                onChange(methodId);

                                                // Find the selected payment method and update context
                                                const selectedMethod = availablePaymentMethods.find(m => m.id === methodId);
                                                onUpdatePaymentMethod(selectedMethod || null);
                                            }}
                                            sx={{ gap: 1 }}
                                        >
                                            {availablePaymentMethods.map((method) => (
                                                <FormControlLabel
                                                    key={method.id}
                                                    value={method.id}
                                                    control={<Radio />}
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: '3px !important' }}>
                                                            <Box sx={{ flexGrow: 1, p: '3px !important' }}>
                                                                <Typography variant="subtitle2">
                                                                    {method.name}
                                                                    {method.additionalCost > 0 && (
                                                                        <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                                                            (+{method.additionalCost} Ft)
                                                                        </Typography>
                                                                    )}
                                                                </Typography>
                                                                {/*<Typography variant="body2" color="text.secondary">
                                                                    {method.type === 'cod' && 'Utánvéttel fizethetsz a kiszállításkor'}
                                                                    {method.type === 'wire' && 'Banki átutalással fizethetsz előre'}
                                                                    {method.type === 'online' && 'Online fizetés bankkártyával vagy PayPal-lal'}
                                                                </Typography>*/}
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {method.type === 'online' && (
                                                                    <Link href="https://simplepartner.hu/PaymentService/Fizetesi_tajekoztato.pdf" target="_blank">
                                                                        <img src="https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/assets/simplepay_bankcard_logos.png" alt="Online Payment" width={260} />
                                                                    </Link>
                                                                )}
                                                                {/*method.type === 'wire' && (
                                                                    <Iconify icon="solar:card-transfer-bold" width={24} />
                                                                )*/}
                                                                {/*method.type === 'cod' && (
                                                                    <Iconify icon="solar:wad-of-money-bold" width={24} />
                                                                )*/}
                                                            </Box>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        m: 0,
                                                        p: 1,
                                                        border: '1px solid',
                                                        borderColor: value === method.id ? 'primary.main' : 'grey.300',
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            borderColor: value === method.id ? 'primary.main' : 'grey.400',
                                                        },
                                                        '& .MuiFormControlLabel-label': {
                                                            width: '100%',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </RadioGroup>
                                        {!!error && (
                                            <FormHelperText error sx={{ px: 2, mt: 1 }}>
                                                {error.message}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                )}
                            />

                            {/* Billing Address Section */}
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                Számlázási cím
                            </Typography>
                            <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    A számlázási cím adatai fognak megjelenni a számlán. Ezek az adatok a fizetés feldolgozásához szükségesek.
                                </Typography>
                                {/* TODO: Add billing address form fields */}
                            </Box>

                            {/* Terms and Conditions Checkboxes */}
                            <Box sx={{ mb: 3 }}>
                                {/* Always show this checkbox */}
                                <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                Elfogadom az{' '}
                                                <Link href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                                                    Általános szerződési feltételeket
                                                </Link>
                                                {' '}és az{' '}
                                                <Link href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                                                    Adatkezelési nyilatkozatot
                                                </Link>
                                                .
                                            </Typography>
                                        }
                                        sx={{ alignItems: 'center', mt: 0 }}
                                    />
                                    {!termsAccepted && (
                                        <FormHelperText error sx={{ ml: 3 }}>
                                            Az Általános szerződési feltételek és az Adatkezelési nyilatkozat elfogadása kötelező!
                                        </FormHelperText>
                                    )}
                                </Box>

                                {/* Data transfer checkbox - conditionally visible */}
                                {checkoutState.selectedPaymentMethod?.slug === 'simple' && (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dataTransferAccepted}
                                                onChange={(e) => setDataTransferAccepted(e.target.checked)}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                A megrendeléssel elfogadom az{' '}
                                                <Link href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                                                    adattovábbítási nyilatkozatot
                                                </Link>
                                                .
                                            </Typography>
                                        }
                                        sx={{ alignItems: 'center', mt: 0 }}
                                    />
                                )}
                            </Box>

                            {/* Order Completion Button */}
                            <Box sx={{ mt: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Button
                                    fullWidth
                                    
                                    type="submit"
                                    variant="contained"
                                    disabled={!isOrderComplete}
                                    loading={isSubmitting}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        ...(isOrderComplete && {
                                            bgcolor: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                            }
                                        }),
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {isOrderComplete ? 'Megrendelés véglegesítése' : 'Kérjük töltse ki az összes mezőt'}
                                    </Typography>
                                    {checkoutState.selectedDeliveryDateTime && (
                                        <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                            {selectedShippingMethod && isPersonalPickup(selectedShippingMethod) ? 'Átvétel' : 'Szállítás'}: {formatDeliveryDisplay}
                                        </Typography>
                                    )}
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Button
                        size="small"
                        color="inherit"
                        onClick={() => onChangeStep('back')}
                        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                    >
                        Vissza
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    

                    <CheckoutSummary
                        checkoutState={checkoutState}
                        onEdit={() => onChangeStep('go', 0)}
                    />

                    
                </Grid>
            </Grid>
        </Form>
    );
}
