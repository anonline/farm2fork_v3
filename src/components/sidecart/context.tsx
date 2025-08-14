import type { ReactNode } from 'react';

import { useState, useContext, createContext } from 'react';

// ----------------------------------------------------------------------

type SideCartContextType = {
    isOpen: boolean;
    openSideCart: () => void;
    closeSideCart: () => void;
    toggleSideCart: () => void;
};

const SideCartContext = createContext<SideCartContextType | undefined>(undefined);

// ----------------------------------------------------------------------

export function useSideCart() {
    const context = useContext(SideCartContext);
    if (!context) {
        throw new Error('useSideCart must be used within a SideCartProvider');
    }
    return context;
}

// ----------------------------------------------------------------------

type SideCartProviderProps = {
    children: ReactNode;
};

export function SideCartProvider({ children }: SideCartProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openSideCart = () => setIsOpen(true);
    const closeSideCart = () => setIsOpen(false);
    const toggleSideCart = () => setIsOpen(prev => !prev);

    return (
        <SideCartContext.Provider
            value={{
                isOpen,
                openSideCart,
                closeSideCart,
                toggleSideCart,
            }}
        >
            {children}
        </SideCartContext.Provider>
    );
}
