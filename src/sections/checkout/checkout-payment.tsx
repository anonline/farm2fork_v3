import type {
    ICheckoutCardOption,
    ICheckoutPaymentOption,
    ICheckoutDeliveryOption,
} from 'src/types/checkout';

import { z as zod } from 'zod';
import { useState } from 'react';
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
    // Not required
    delivery: zod.number(),
});

// ----------------------------------------------------------------------

export function CheckoutPayment() {
    const [deliveryType, setDeliveryType] = useState<string>('hazhozszallitas');
    
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
        }
    };

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
