import { FeaturedProductsProvider, StarProductsProvider } from 'src/contexts/products-context';
import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <FeaturedProductsProvider>
            <StarProductsProvider>
                <MainLayout>{children}</MainLayout>
            </StarProductsProvider>
        </FeaturedProductsProvider>
    )
}
