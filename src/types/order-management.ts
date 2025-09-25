import type { IAddressItem } from './common';
import type { IPaymentMethod } from './payment-method';

// ----------------------------------------------------------------------

export type OrderStatus = 
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipping'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus = 
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_paid'
    | 'closed';

export type ShippingMethod = {
    id: number;
    name: string;
    description?: string;
    cost: number;
};

export type OrderHistoryEntry = {
    timestamp: string;
    status: OrderStatus | PaymentStatus;
    note?: string;
    userId?: string;
    userName?: string;
};

export type IOrderItem = {
    id: string;
    name: string;
    size?: string;
    netPrice: number;
    grossPrice: number;
    vatPercent?: number;
    unit?: string;
    coverUrl: string;
    quantity: number;
    subtotal: number;
    note?: string;
    custom?: boolean;
    slug?: string;
};

export type IOrderData = {
    id: string;
    dateCreated: string;
    customerId: string | null;
    customerName: string;
    billingEmails: string[];
    notifyEmails: string[];
    note: string;
    shippingAddress: IAddressItem | null;
    billingAddress: IAddressItem | null;
    denyInvoice: boolean;
    needVAT: boolean;
    surchargeAmount: number;
    items: IOrderItem[];
    subtotal: number;
    shippingCost: number;
    vatTotal: number;
    discountTotal: number;
    total: number;
    payedAmount: number;
    shippingMethod: ShippingMethod | null;
    paymentMethod: IPaymentMethod | null;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    paymentDueDays: number;
    courier: string | null;
    plannedShippingDateTime: Date | null;
    simplepayDataJson: string | null;
    invoiceDataJson: Record<string, any> | null;
    history: OrderHistoryEntry[];
    shipmentId: number | null;
    shipment_time?: string;
};

export type ICreateOrderData = {
    customerId: string | null;
    customerName: string;
    billingEmails: string[];
    notifyEmails: string[];
    note: string;
    shippingAddress: IAddressItem | null;
    billingAddress: IAddressItem | null;
    denyInvoice: boolean;
    needVAT: boolean;
    surchargeAmount: number;
    items: IOrderItem[];
    subtotal: number;
    shippingCost: number;
    vatTotal: number;
    discountTotal: number;
    total: number;
    shippingMethod: ShippingMethod | null;
    paymentMethod: IPaymentMethod | null;
    paymentDueDays: number;
    plannedShippingDateTime: string | null;
};
