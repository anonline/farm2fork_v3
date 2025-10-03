import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

export type IPaymentCard = {
    id: string;
    cardType: string;
    primary?: boolean;
    cardNumber: string;
};

export type IAddressItem = {
    id?: string;
    name: string;
    company?: string;
    primary?: boolean;
    fullAddress: string;
    phoneNumber?: string;
    addressType?: string;
    postcode?: string;
    city?: string;
    street?: string;
    floor?: string;
    houseNumber?: string;
    doorbell?: string;
    note?: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
};

export type IDateValue = string | number | null;

export type IDatePickerControl = Dayjs | null;

export type ISocialLink = {
    twitter: string;
    facebook: string;
    linkedin: string;
    instagram: string;
};
