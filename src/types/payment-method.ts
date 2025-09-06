export interface IPaymentMethod {
    id: number;
    name: string;
    slug: string;
    type: 'cod' | 'wire' | 'online';
    additionalCost: number;
    protected: boolean;
    enablePublic: boolean;
    enableVIP: boolean;
    enableCompany: boolean;
}
