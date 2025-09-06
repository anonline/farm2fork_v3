export interface IShippingCostMethod {
    id: number;
    name: string;
    enabledPublic: boolean;
    enabledVIP: boolean;
    enabledCompany: boolean;
    netCostPublic: number;
    netCostVIP: number;
    netCostCompany: number;
    vat: number;
    vatPublic: boolean;
    vatVIP: boolean;
    vatCompany: boolean;
    minNetPrice: number;
    maxNetPrice: number;
}
