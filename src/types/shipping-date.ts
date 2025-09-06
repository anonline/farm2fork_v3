export interface IShippingZone {
    ID: number;
    Iranyitoszam: string;
    RendelesiNap: number; // 1-7 (Monday to Sunday)
    CutoffIdo: string; // HH:MM:SS format
    SzallitasiNap: number; // 1-6 (Monday to Saturday)
}

export interface IDeniedShippingDate {
    date: string; // YYYY-MM-DD format
}

export interface IAvailableDeliveryDate {
    date: string; // YYYY-MM-DD format
    displayDate: string; // e.g., "2025.09.02. kedd"
    isAvailable: boolean;
    isDenied: boolean;
}

export interface IAvailablePickupTime {
    date: string; // YYYY-MM-DD format
    displayDate: string; // e.g., "2025.08.28."
    timeRange: string; // e.g., "06:00-19:00"
    isAvailable: boolean;
    isDenied: boolean;
}

export interface IPickupLocationSchedule {
    id: number;
    name: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
