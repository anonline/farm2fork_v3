export interface IDeliveryAddress {
    id?: string; // Unique identifier for the address
    fullName: string;
    companyName?: string;
    city: string;
    street: string;
    houseNumber: string;
    doorbell?: string;
    isDefault?: boolean;
    postcode?: string;
    floor?: string;
    comment?: string;
    phone: string;
    type?: 'shipping' | 'billing'; // Address type
}

export interface IBillingAddress {
    id?: string; // Unique identifier for the address
    fullName: string;
    companyName?: string;
    city: string;
    street: string;
    houseNumber: string;
    floor?: string;
    doorbell?: string;
    phone?: string;
    taxNumber?: string;
    email?: string;
    comment?: string;
    isDefault?: boolean;
    postcode?: string;
    type: 'billing'; // Always billing for this interface
}

export interface ICustomerData {
    id: number;
    created_at: string;
    firstname: string | null;
    lastname: string | null;
    companyName: string | null;
    uid: string | null;
    newsletterConsent: boolean;
    deliveryAddress: IDeliveryAddress[] | null;
    billingAddress: IBillingAddress[] | null; // Updated to be array of IBillingAddress
    acquisitionSource: string | null;
    isCompany: boolean;
    discountPercent: number;
    paymentDue: number;
    mailchimpId: string;
}
