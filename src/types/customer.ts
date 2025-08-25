export interface IDeliveryAddress {
  fullName: string;
  zipCode: string;
  city: string;
  streetAddress: string;
  floorDoor?: string;
  comment?: string;
  phone: string;
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
