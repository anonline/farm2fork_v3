// ----------------------------------------------------------------------

export type IShippingZone = {
    ID: number;
    Iranyitoszam: string; // postal code
    RendelesiNap: number; // order day (1-7, Monday-Sunday)
    CutoffIdo: string; // cutoff time in HH:MM:SS format
    SzallitasiNap: number; // delivery day (1-6, Monday-Saturday)
};

export type IShippingZoneFilters = {
    postalCode?: string;
};
