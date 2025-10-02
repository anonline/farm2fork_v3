export type WPTransferUser = {
    id: number;
    uid?: string;
    email: string;
    lastname?: string;
    firstname?: string;
    company?: string;
    password: string;
    usertype?: string;
    billingaddresses?: WPBillingAddress[];
    shippingaddresses?: WPShippingAddress[];
    mailchimpid?: string;
    invoicedue?: number;
    roles?: WPCapablities;
    from?: string;
};

export type WPCapablities = {
    [key in WPUserRoles]: boolean;
};

export enum WPUserRoles {
    administrator = 'administrator',
    editor = 'editor',
    author = 'author',
    contributor = 'contributor',
    subscriber = 'subscriber',
    customer = 'customer',
    shop_manager = 'shop_manager',
    vip = 'vsrl_-_vip',
    company = 'Company_Customer',
    minus5percent = 'minus5percent',
    minus10percent = 'minus10percent',
    minus15percent = 'minus15percent',
    minus20percent = 'minus20percent',
    minus25percent = 'minus25percent',
    minus30percent = 'minus30percent',
    minus50percent = 'minus50percent',
}

export type WPShippingAddress = {
    sid: string;
    city: string;
    note: string;
    phone: string;
    action: string;
    country: string;
    doorbell?: string;
    fullName: string;
    postcode: string;
    address_1: string;
    address_2?: string;
    defaultCB?: string;
    last_name: string;
    first_name: string;
    houseNumber?: string;
    company?: string;
};

export type WPBillingAddress = {
    vat: string;
    city: string;
    ring?: string;
    email: string;
    phone: string;
    state?: string;
    company: string;
    country: string;
    postcode: string;
    address_1: string;
    address_2?: string;
    last_name: string;
    first_name: string;
};