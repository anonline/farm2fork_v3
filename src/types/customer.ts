export interface IDeliveryAddress {
    id?: string; // Unique identifier for the address
    fullName: string;
    zipCode: string;
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

export interface ICustomerData {
    id: number;
    created_at: string;
    firstname: string | null;
    lastname: string | null;
    companyName: string | null;
    uid: string | null;
    newsletterConsent: boolean;
    deliveryAddress: IDeliveryAddress[] | null;
    billingAddress: any | null;
    acquisitionSource: string | null;
}
