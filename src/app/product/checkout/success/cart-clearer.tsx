'use client';

import { useEffect } from 'react';

import { useCheckoutContext } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

type CartClearerProps = {
    shouldClear: boolean;
};

export function CartClearer({ shouldClear }: Readonly<CartClearerProps>) {
    const { onResetCart } = useCheckoutContext();

    useEffect(() => {
        if (shouldClear) {
            // Force clear the cart by directly resetting state to initial values
            onResetCart();
        }
    }, [shouldClear, onResetCart]);

    return null; // This component doesn't render anything
}
