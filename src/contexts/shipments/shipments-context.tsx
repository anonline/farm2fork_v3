'use client';

import type { IShipment } from 'src/types/shipments';

import { useContext, createContext } from 'react';

// ----------------------------------------------------------------------

export type ShipmentsContextType = {
    shipments: IShipment[];
    shipmentsLoading: boolean;
    shipmentsError: string | null;
    shipmentsMutate: () => Promise<void>;
    addShipment: (newShipment: Omit<IShipment, 'date' | 'updatedAt'>) => Promise<void>;
    refreshCounts: (shipmentId: number) => Promise<void>;
    setOrderToShipment: (orderId: string, shipmentId: number) => Promise<void>;
    removeOrderFromShipment: (orderId: string) => Promise<void>;
    setOrderToShipmentByDate: (orderId: string, date: Date | string | null) => Promise<void>;
    deleteShipment: (shipmentId: number) => Promise<{ success: boolean; error?: string; orderCount?: number }>;
};

export const ShipmentsContext = createContext<ShipmentsContextType | undefined>(undefined);

export const useShipments = () => {
    const context = useContext(ShipmentsContext);
    if (!context) {
        throw new Error('useShipments must be used within a ShipmentsProvider');
    }
    return context;
};
