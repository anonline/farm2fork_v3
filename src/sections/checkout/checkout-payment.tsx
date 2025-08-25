import type {
    ICheckoutCardOption,
    ICheckoutPaymentOption,
    ICheckoutDeliveryOption,
} from 'src/types/checkout';
import type { IPickupLocation } from 'src/types/pickup-location';

import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useGetPickupLocations } from 'src/actions/pickup-location';
import { PickupLocationSelector } from './components';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS: ICheckoutDeliveryOption[] = [
    { value: 0, label: 'Free', description: '5-7 days delivery' },
    { value: 10, label: 'Standard', description: '3-5 days delivery' },
    { value: 20, label: 'Express', description: '2-3 days delivery' },
];

const PAYMENT_OPTIONS: ICheckoutPaymentOption[] = [
    {
        value: 'paypal',
        label: 'Pay with Paypal',
        description: 'You will be redirected to PayPal website to complete your purchase securely.',
    },
    {
        value: 'creditcard',
        label: 'Credit / Debit card',
        description: 'We support Mastercard, Visa, Discover and Stripe.',
    },
    { value: 'cash', label: 'Cash', description: 'Pay with cash when your order is delivered.' },
];

const CARD_OPTIONS: ICheckoutCardOption[] = [
    { value: 'visa1', label: '**** **** **** 1212 - Jimmy Holland' },
    { value: 'visa2', label: '**** **** **** 2424 - Shawn Stokes' },
    { value: 'mastercard', label: '**** **** **** 4545 - Cole Armstrong' },
];

// ----------------------------------------------------------------------

export type PaymentSchemaType = zod.infer<typeof PaymentSchema>;

export const PaymentSchema = zod.object({
    payment: zod.string().min(1, { message: 'Payment is required!' }),
    deliveryType: zod.string().min(1, { message: 'Delivery type is required!' }),
    pickupLocation: zod.number().optional(),
    // Not required
    delivery: zod.number(),
}).refine((data) => {
    // If delivery type is personal pickup, pickup location is required
    if (data.deliveryType === 'szemelyes_atvetel') {
        return data.pickupLocation !== undefined;
    }
    return true;
}, {
    message: 'Pickup location is required for personal pickup!',
    path: ['pickupLocation'],
});

// ----------------------------------------------------------------------

export function CheckoutPayment() {
    const [deliveryType, setDeliveryType] = useState<string>('hazhozszallitas');
    const [selectedPickupLocation, setSelectedPickupLocation] = useState<number | null>(null);
    
    const { locations: pickupLocations } = useGetPickupLocations();
    
    const {
        loading,
        onResetCart,
        onChangeStep,
        onApplyShipping,
        state: checkoutState,
    } = useCheckoutContext();

    const defaultValues: PaymentSchemaType = {
        delivery: checkoutState.shipping,
        payment: '',
        deliveryType: deliveryType,
        pickupLocation: selectedPickupLocation || undefined,
    };

    const methods = useForm<PaymentSchemaType>({
        resolver: zodResolver(PaymentSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = methods;

    const handleDeliveryTypeChange = (event: React.MouseEvent<HTMLElement>, newDeliveryType: string | null) => {
        if (newDeliveryType !== null) {
            setDeliveryType(newDeliveryType);
            setValue('deliveryType', newDeliveryType);
            
            // Reset pickup location when switching to home delivery
            if (newDeliveryType === 'hazhozszallitas') {
                setSelectedPickupLocation(null);
                setValue('pickupLocation', undefined);
            } else {
                // Set default pickup location (Farm2Fork raktár) when switching to pickup
                const defaultPickup = pickupLocations.find(loc => loc.enabled && loc.name.includes('Farm2Fork'));
                if (defaultPickup) {
                    setSelectedPickupLocation(defaultPickup.id);
                    setValue('pickupLocation', defaultPickup.id);
                }
            }
        }
    };

    const handlePickupLocationChange = (locationId: number) => {
        setSelectedPickupLocation(locationId);
        setValue('pickupLocation', locationId);
    };

    // Initialize default pickup location when locations are loaded
    useEffect(() => {
        if (pickupLocations.length > 0 && deliveryType === 'szemelyes_atvetel' && !selectedPickupLocation) {
            const defaultPickup = pickupLocations.find(loc => loc.enabled && loc.name.includes('Farm2Fork'));
            if (defaultPickup) {
                setSelectedPickupLocation(defaultPickup.id);
                setValue('pickupLocation', defaultPickup.id);
            }
        }
    }, [pickupLocations, deliveryType, selectedPickupLocation, setValue]);

    const onSubmit = handleSubmit(async (data) => {
        try {
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
                        defaultExpanded 
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
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                1
                            </Box>
                            <Typography variant="h6">
                                Szállítás részletei
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Kérjük add meg a szállítási adatokat
                                </Typography>
                                <ToggleButtonGroup 
                                    value={deliveryType} 
                                    exclusive 
                                    fullWidth
                                    onChange={handleDeliveryTypeChange}
                                    sx={{ mb: 2 }}
                                >
                                    <ToggleButton value="hazhozszallitas">
                                        Házhozszállítás
                                    </ToggleButton>
                                    <ToggleButton value="szemelyes_atvetel">
                                        Személyes átvétel
                                    </ToggleButton>
                                </ToggleButtonGroup>

                                {/* Pickup Locations Selection */}
                                {deliveryType === 'szemelyes_atvetel' && (
                                    <PickupLocationSelector
                                        selectedPickupLocation={selectedPickupLocation}
                                        onLocationChange={handlePickupLocationChange}
                                    />
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <CheckoutDelivery
                        name="delivery"
                        onApplyShipping={onApplyShipping}
                        options={DELIVERY_OPTIONS}
                    />

                    <CheckoutPaymentMethods
                        name="payment"
                        options={{ cards: CARD_OPTIONS, payments: PAYMENT_OPTIONS }}
                        sx={{ my: 3 }}
                    />

                    <Button
                        size="small"
                        color="inherit"
                        onClick={() => onChangeStep('back')}
                        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                    >
                        Back
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <CheckoutBillingInfo
                        loading={loading}
                        onChangeStep={onChangeStep}
                        checkoutState={checkoutState}
                    />

                    <CheckoutSummary
                        checkoutState={checkoutState}
                        onEdit={() => onChangeStep('go', 0)}
                    />

                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        Complete order
                    </Button>
                </Grid>
            </Grid>
        </Form>
    );
}
