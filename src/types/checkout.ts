import type { IAddressItem } from './common';

// ----------------------------------------------------------------------

export type ICheckoutItem = {
    id: number;
    name: string;
    size?: string;
    price: number;
    unit?: string;
    coverUrl: string;
    colors?: string[];
    quantity: number;
    available: number;
    subtotal?: number;
    note?: string;
    minQuantity?: number;
    maxQuantity?: number;
    stepQuantity?: number;
    custom?: boolean;
};

export type ICheckoutDeliveryOption = {
    label: string;
    value: number;
    description: string;
};

export type ICheckoutPaymentOption = {
    value: string;
    label: string;
    description: string;
};

export type ICheckoutCardOption = {
    value: string;
    label: string;
};

export type ICheckoutState = {
    total: number;
    subtotal: number;
    discount: number;
    shipping: number;
    surcharge: number;
    totalItems: number;
    items: ICheckoutItem[];
    billing: IAddressItem | null;
};

export type CheckoutContextValue = {
    loading: boolean;
    completed: boolean;
    canReset: boolean;
    /********/
    state: ICheckoutState;
    setState: (updateValue: Partial<ICheckoutState>) => void;
    setField: (
        name: keyof ICheckoutState,
        updateValue: ICheckoutState[keyof ICheckoutState]
    ) => void;
    /********/
    steps: string[];
    activeStep: number | null;
    onChangeStep: (type: 'back' | 'next' | 'go', step?: number) => void;
    /********/
    onChangeItemQuantity: (itemId: number, quantity: number) => void;
    /********/
    onResetCart: () => void;
    onAddToCart: (newItem: ICheckoutItem) => void;
    onDeleteCartItem: (itemId: number) => void;
    onApplyDiscount: (discount: number) => void;
    onApplyShipping: (discount: number) => void;
    onApplySurcharge: (surcharge: number) => void;
    onCreateBillingAddress: (address: IAddressItem) => void;
    onAddNote: (itemId:number, note:string) => void;
    onDeleteNote: (itemId:number) => void;
};
