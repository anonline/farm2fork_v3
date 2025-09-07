export interface IShippingAddress {
    id?: string;
    type: 'shipping';
    fullName: string;
    companyName?: string;
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
    floor?: string;
    doorbell?: string;
    phone: string;
    comment?: string;
    isDefault: boolean;
}

export interface IBillingAddress {
    id?: string;
    type: 'billing';
    fullName: string;
    companyName?: string;
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
    phone?: string;
    taxNumber?: string;
    email?: string;
    comment?: string;
    isDefault: boolean;
}

export type IAddress = IShippingAddress | IBillingAddress;

export interface IAddressData {
    shippingAddresses: IShippingAddress[];
    billingAddresses: IBillingAddress[];
}