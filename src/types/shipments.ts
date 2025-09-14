export interface IShipment {
    id: number;
    date: Date;
    productCount: number;
    productAmount: number;
    orderCount: number;
    updatedAt: Date;
}

export type IShipmentsTableFilters = {
    // Add filter properties here if needed in the future
    // For now, keeping it empty but available for expansion
};