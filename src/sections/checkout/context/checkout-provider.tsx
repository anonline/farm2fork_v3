'use client';

import type { IAddressItem } from 'src/types/common';
import type { IPaymentMethod } from 'src/types/payment-method';
import type { ICheckoutItem, ICheckoutState } from 'src/types/checkout';

import { isEqual } from 'es-toolkit';
import { getStorage } from 'minimal-shared/utils';
import { useLocalStorage } from 'minimal-shared/hooks';
import { useMemo, useState, Suspense, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { useGetOption } from 'src/actions/options';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';

import { OptionsEnum } from 'src/types/option';

import { CheckoutContext } from './checkout-context';

// ----------------------------------------------------------------------

const CHECKOUT_STORAGE_KEY = 'app-checkout';
const CHECKOUT_STEPS = ['Cart', 'Payment'];

const initialState: ICheckoutState = {
    userId: null,
    items: [],
    subtotal: 0,
    total: 0,
    discount: 0,
    shipping: 0,
    surcharge: 0,
    billing: null,
    delivery: null,
    totalItems: 0,
    notificationEmails: [],
    deliveryComment: '',
    selectedDeliveryDateTime: null,
    selectedPaymentMethod: null,
};

// ----------------------------------------------------------------------

type CheckoutProviderProps = {
    children: React.ReactNode;
};

export function CheckoutProvider({ children }: Readonly<CheckoutProviderProps>) {
    return (
        <Suspense fallback={<SplashScreen />}>
            <CheckoutContainer>{children}</CheckoutContainer>
        </Suspense>
    );
}

// ----------------------------------------------------------------------

function CheckoutContainer({ children }: Readonly<CheckoutProviderProps>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeStep = pathname.includes(paths.product.checkout)
        ? Number(searchParams.get('step'))
        : null;

    const { user, authenticated } = useAuthContext();

    const [loading, setLoading] = useState(true);

    const { state, setState, setField, resetState } = useLocalStorage<ICheckoutState>(
        CHECKOUT_STORAGE_KEY,
        initialState,
        { initializeWithValue: false }
    );

    // Initialize userId and handle cart persistence logic with proper loading state
    useEffect(() => {
        if (loading) return; // Wait for initial load to complete
        
        if (user?.id && !state.userId) {
            // Set userId for authenticated user with existing cart
            setField('userId', user.id);
        }
        if(!user?.id && state.userId) {
            // Clear cart for unauthenticated user with existing cart
            resetState(initialState);
        }

    }, [user?.id, state.userId, resetState, setField, loading]);
    


    // Get surcharge options based on user type
    const { option: surchargePublic } = useGetOption(OptionsEnum.SurchargePercentPublic);
    const { option: surchargeVIP } = useGetOption(OptionsEnum.SurchargePercentVIP);
    const { option: surchargeCompany } = useGetOption(OptionsEnum.SurchargePercentCompany);

    // Determine user type for surcharge calculation
    const getUserType = useCallback(() => {
        if (!authenticated) return 'public';
        if (user?.user_metadata?.is_admin) return 'public'; // admin treated as public
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    }, [authenticated, user?.user_metadata]);

    // Get the appropriate surcharge percentage based on user type
    const getSurchargePercent = useCallback(() => {
        if (
            state.selectedPaymentMethod != undefined &&
            (state.selectedPaymentMethod?.slug == 'utanvet' ||
                state.selectedPaymentMethod?.slug == 'utalas')
        ) {
            return 0;
        }

        const userType = getUserType();
        switch (userType) {
            case 'vip':
                return surchargeVIP ?? 0;
            case 'company':
                return surchargeCompany ?? 0;
            default:
                return surchargePublic ?? 0;
        }
    }, [surchargeVIP, surchargeCompany, surchargePublic, state.selectedPaymentMethod, getUserType]);

    const canReset = !isEqual(state, initialState);
    const completed = activeStep === CHECKOUT_STEPS.length;

    const updateTotals = useCallback(() => {
        const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        const subtotal = state.items.reduce(
            (total, item) => total + (item.custom === true ? 1 : item.quantity) * item.grossPrice,
            0
        );

        // Calculate surcharge based on subtotal and user type
        const surchargePercent = getSurchargePercent();
        const surcharge = (subtotal * surchargePercent) / 100;

        setField('subtotal', subtotal);
        setField('totalItems', totalItems);
        setField('surcharge', surcharge);

        // Calculate payment method additional cost
        const paymentAdditionalCost = state.selectedPaymentMethod?.additionalCost || 0;

        setField(
            'total',
            subtotal + surcharge - state.discount + state.shipping + paymentAdditionalCost
        );
    }, [
        setField,
        state.discount,
        state.items,
        state.shipping,
        state.selectedPaymentMethod,
        getSurchargePercent,
    ]);

    useEffect(() => {
        const initializeCheckout = async () => {
            try {
                setLoading(true);
                const restoredValue = getStorage(CHECKOUT_STORAGE_KEY);
                if (restoredValue) {
                    // Just initialize, don't call updateTotals here as it will be called by the second useEffect
                }
            } finally {
                setLoading(false);
            }
        };

        initializeCheckout();
    }, []); // Only run once on mount

    // Update totals whenever items, surcharge options, or user type changes
    useEffect(() => {
        if (!loading) {
            updateTotals();
        }
    }, [
        state.items,
        surchargePublic,
        surchargeVIP,
        surchargeCompany,
        authenticated,
        user?.user_metadata?.is_vip,
        user?.user_metadata?.is_corp,
        user?.user_metadata?.is_admin,
        updateTotals,
        loading,
    ]);

    const onChangeStep = useCallback(
        (type: 'back' | 'next' | 'go', step?: number) => {
            const stepNumbers = {
                back: (activeStep ?? 0) - 1,
                next: (activeStep ?? 0) + 1,
                go: step ?? 0,
            };

            const targetStep = stepNumbers[type];
            const queryString = new URLSearchParams({ step: `${targetStep}` }).toString();
            const redirectPath =
                targetStep === 0
                    ? paths.product.checkout
                    : `${paths.product.checkout}?${queryString}`;

            router.push(redirectPath);
        },
        [activeStep, router]
    );

    const onAddToCart = useCallback(
        (newItem: ICheckoutItem) => {
            newItem.quantity = Math.max(newItem.quantity, newItem.minQuantity ?? 1);
            newItem.quantity = Math.min(newItem.quantity, newItem.maxQuantity ?? 100);
            newItem.quantity = Math.round(newItem.quantity / (newItem.stepQuantity ?? 1)) * (newItem.stepQuantity ?? 1);
            newItem.subtotal = (newItem.custom === true ? 1 : newItem.quantity) * newItem.grossPrice;

            const updatedItems = state.items.map((item) => {
                if (item.id === newItem.id) {
                    return {
                        ...item,
                        quantity: item.quantity + newItem.quantity,
                        subtotal: (item?.subtotal || 0) + (newItem?.subtotal || 0),
                    };
                }
                return item;
            });

            if (!updatedItems.some((item) => item.id === newItem.id)) {
                updatedItems.push(newItem);
            }
            setField('items', updatedItems);
            // Totals will be updated by the useEffect hook
        },
        [setField, state.items]
    );

    const onDeleteCartItem = useCallback(
        (itemId: string) => {
            const updatedItems = state.items.filter((item) => item.id !== itemId);

            setField('items', updatedItems);
            // Totals will be updated by the useEffect hook
        },
        [setField, state.items]
    );

    const onChangeItemQuantity = useCallback(
        (itemId: string, quantity: number) => {
            const updatedItems = state.items.map((item) => {
                if (item.id === itemId) {
                    if (quantity < (item.minQuantity ?? 1)) {
                        quantity = item.minQuantity ?? 1;
                    }

                    if (quantity % (item.stepQuantity ?? 1) != 0) {
                        quantity =
                            Math.round(quantity / (item.stepQuantity ?? 1)) *
                            (item.stepQuantity ?? 1);
                    }

                    if (quantity > (item.maxQuantity ?? 100)) {
                        quantity = item.maxQuantity ?? 100;
                    }

                    //If we are modifying custom item, we do not know the price so keep the base price
                    if (item.custom === true) {
                        item.subtotal = item.grossPrice;
                    } else {
                        item.subtotal = item.grossPrice * quantity;
                    }

                    return { ...item, quantity };
                }
                return item;
            });

            setField('items', updatedItems);
            // Totals will be updated by the useEffect hook
        },
        [setField, state.items]
    );

    const onCreateBillingAddress = useCallback(
        (address: IAddressItem) => {
            setField('billing', address);
        },
        [setField]
    );

    const onCreateDeliveryAddress = useCallback(
        (address: IAddressItem) => {
            setField('delivery', address);
        },
        [setField]
    );

    const onApplyDiscount = useCallback(
        (discount: number) => {
            setField('discount', discount);
        },
        [setField]
    );

    const onApplyShipping = useCallback(
        (shipping: number) => {
            setField('shipping', shipping);
        },
        [setField]
    );

    const onApplySurcharge = useCallback(
        (surcharge: number) => {
            setField('surcharge', surcharge);
        },
        [setField]
    );

    const onResetCart = useCallback(() => {
        resetState(initialState);
    }, [resetState]);

    const onAddNote = useCallback(
        (itemId: string, note: string) => {
            if (note.trim().length > 0) {
                const updatedItems = state.items.map((item) => {
                    if (item.id === itemId) {
                        item.note = note.trim();
                        return { ...item };
                    }
                    return item;
                });

                setField('items', updatedItems);
                // Note: No need to update totals for note changes
            }
        },
        [setField, state.items]
    );

    const onDeleteNote = useCallback(
        (itemId: string) => {
            const updatedItems = state.items.map((item) => {
                if (item.id === itemId) {
                    item.note = undefined;
                    return { ...item };
                }
                return item;
            });

            setField('items', updatedItems);
            // Note: No need to update totals for note changes
        },
        [setField, state.items]
    );

    const onUpdateNotificationEmails = useCallback(
        (emails: string[]) => {
            setField('notificationEmails', emails);
        },
        [setField]
    );

    const onUpdateDeliveryComment = useCallback(
        (comment: string) => {
            setField('deliveryComment', comment);
        },
        [setField]
    );

    const onUpdateDeliveryDateTime = useCallback(
        (dateTime: string | null) => {
            setField('selectedDeliveryDateTime', dateTime);
        },
        [setField]
    );

    const onResetDeliveryDateTime = useCallback(() => {
        setField('selectedDeliveryDateTime', null);
    }, [setField]);

    const onUpdatePaymentMethod = useCallback(
        (paymentMethod: IPaymentMethod | null) => {
            setField('selectedPaymentMethod', paymentMethod);
        },
        [setField]
    );

    const memoizedValue = useMemo(
        () => ({
            state,
            setState,
            setField,
            /********/
            activeStep,
            onChangeStep,
            steps: CHECKOUT_STEPS,
            /********/
            canReset,
            loading,
            completed,
            /********/
            onAddToCart,
            onResetCart,
            onApplyDiscount,
            onApplyShipping,
            onApplySurcharge,
            onDeleteCartItem,
            onChangeItemQuantity,
            onCreateBillingAddress,
            onCreateDeliveryAddress,
            onAddNote,
            onDeleteNote,
            onUpdateNotificationEmails,
            onUpdateDeliveryComment,
            onUpdateDeliveryDateTime,
            onResetDeliveryDateTime,
            onUpdatePaymentMethod,
        }),
        [
            state,
            loading,
            canReset,
            setField,
            setState,
            completed,
            activeStep,
            onResetCart,
            onAddToCart,
            onChangeStep,
            onApplyDiscount,
            onApplyShipping,
            onApplySurcharge,
            onDeleteCartItem,
            onChangeItemQuantity,
            onCreateBillingAddress,
            onCreateDeliveryAddress,
            onAddNote,
            onDeleteNote,
            onUpdateNotificationEmails,
            onUpdateDeliveryComment,
            onUpdateDeliveryDateTime,
            onResetDeliveryDateTime,
            onUpdatePaymentMethod,
        ]
    );

    return <CheckoutContext value={memoizedValue}>{children}</CheckoutContext>;
}
