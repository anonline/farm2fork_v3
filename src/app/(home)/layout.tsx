import { MainLayout } from 'src/layouts/main';
import { PartnersProvider } from 'src/contexts/partners-context';
import { StarProductsProvider, FeaturedProductsProvider } from 'src/contexts/products-context';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <FeaturedProductsProvider>
            <StarProductsProvider>
                <PartnersProvider>
                    <MainLayout>{children}</MainLayout>
                </PartnersProvider>
            </StarProductsProvider>
        </FeaturedProductsProvider>
    )
}
