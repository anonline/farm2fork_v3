
import { MainLayout } from 'src/layouts/main';
import { ShippingProvider } from 'src/contexts/shipping-context';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <ShippingProvider>
            <GuestGuard>
                <MainLayout>
                    {children}
                </MainLayout>
            </GuestGuard>
        </ShippingProvider>
    );
}
