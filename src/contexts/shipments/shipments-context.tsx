'use client';

import { useContext, createContext } from 'react';
import { IShipment } from 'src/types/shipments';

// ----------------------------------------------------------------------

export type ShipmentsContextType = {
    shipments: IShipment[];
    shipmentsLoading: boolean;
    shipmentsError: string | null;
    shipmentsMutate: () => Promise<void>;
    addShipment: (newShipment: Omit<IShipment, 'date' | 'updatedAt'>) => Promise<void>;
    refreshCounts: (shipmentId: string) => Promise<void>;
    setOrderToShipment: (orderId: string, shipmentId: string) => Promise<void>;
    removeOrderFromShipment: (orderId: string) => Promise<void>;
};

export const ShipmentsContext = createContext<ShipmentsContextType | undefined>(undefined);

export const useShipments = () => {
    const context = useContext(ShipmentsContext);
    if (!context) {
        throw new Error('useShipments must be used within a ShipmentsProvider');
    }
    return context;
};
