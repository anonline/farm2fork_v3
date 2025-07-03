import { MainLayout } from 'src/layouts/main';
import { StarProductsProvider, FeaturedProductsProvider } from 'src/contexts/products-context';

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
