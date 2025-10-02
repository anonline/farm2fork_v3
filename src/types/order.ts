import type { IAddress } from './address';
import type { IDateValue, IDatePickerControl } from './common';

// ----------------------------------------------------------------------

export type IOrderTableFilters = {
    name: string;
    status: string;
    endDate: IDatePickerControl;
    startDate: IDatePickerControl;
    shipments: string[];
    roles: string[];
    shippingMethods: string[];
    paymentMethods: string[];
    paymentStatuses: string[];
};

export type IOrderHistory = {
    orderTime: IDateValue;
    paymentTime: IDateValue;
    deliveryTime: IDateValue;
    completionTime: IDateValue;
    timeline: { title: string; time: IDateValue }[];
};

export type IOrderShippingAddress = {
    fullAddress: string;
    phoneNumber: string;
    postcode?: string;
    city?: string;
    street?: string;
    floor?: string;
    houseNumber?: string;
    doorbell?: string;
    note?: string;
    name: string;
    company?: string;
    taxNumber?: string;
    email?: string;
};

export type IOrderPayment = {
    cardType: string;
    cardNumber: string;
    status?: string;
};

export type IOrderDelivery = {
    shipBy: string;
    address: IAddress | null;
};

export type IOrderCustomer = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    ipAddress: string;
    userType: 'public' | 'vip' | 'company';
};

export type IOrderProductItem = {
    id: string;
    sku: string;
    name: string;
    netPrice: number;
    grossPrice: number;
    coverUrl: string;
    quantity: number;
    unit: string;
    note: string;
    subtotal: number;
    slug: string;
    vat: number;
};

export type IOrderItem = {
    id: string;
    taxes: number;
    status: string;
    shipping: number;
    discount: number;
    subtotal: number;
    deposit: number;
    orderNumber: string;
    totalAmount: number;
    totalQuantity: number;
    createdAt: IDateValue;
    history: IOrderHistory;
    payment: IOrderPayment;
    customer: IOrderCustomer;
    delivery: IOrderDelivery;
    items: IOrderProductItem[];
    shippingAddress: IOrderShippingAddress;
    planned_shipping_date_time: Date | null;
    shipmentId: number | null;
    shipment_time?: string;
};

export enum OrderStatusEnum {
    Completed = 'Teljesítve',
    Processing = 'Feldolgozás alatt',
    Cancelled = 'Visszamondva',
    Pending = 'Függőben',
    Refunded = 'Visszatérítve',
    Shipped = 'Kiszállítva',
}
