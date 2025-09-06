export interface IPickupLocation {
    id: number;
    name: string;
    postcode: string;
    city: string;
    address: string;
    note?: string;
    enabled: boolean;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
