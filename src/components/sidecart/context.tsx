import type { ReactNode } from 'react';

import { useState, useEffect, useContext, createContext } from 'react';

import { usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type SideCartContextType = {
    isOpen: boolean;
    isDisabled: boolean;
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
    const pathname = usePathname();

    // Check if we're on the checkout page
    const isOnCheckoutPage = pathname === '/product/checkout/';

    const openSideCart = () => {
        
        if (!isOnCheckoutPage) {
            setIsOpen(true);
        }
    };

    const closeSideCart = () => setIsOpen(false);

    const toggleSideCart = () => {
        if (!isOnCheckoutPage) {
            setIsOpen(prev => !prev);
        }
    };

    // Close sidecart if navigating to checkout page
    useEffect(() => {
        if (isOnCheckoutPage && isOpen) {
            setIsOpen(false);
        }
    }, [isOnCheckoutPage, isOpen]);

    return (
        <SideCartContext.Provider
            value={{
                isOpen,
                isDisabled: isOnCheckoutPage,
                openSideCart,
                closeSideCart,
                toggleSideCart,
            }}
        >
            {children}
        </SideCartContext.Provider>
    );
}
