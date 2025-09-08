import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs/custom-breadcrumbs";
import { DashboardContent } from "src/layouts/dashboard/content";
import { paths } from "src/routes/paths";
import WooImportStatusPage from "../woocommerce-status-card";

type Props = {
    status: any;
    products: any[];
    categories: any[];
    producers: any[];
};

export default function WooImportPage({ status, products, categories, producers }: Props) {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Woocommerce Import"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Woocommerce' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <WooImportStatusPage status={status} wooProducts={products} wooCategories={categories} wooProducers={producers} />

        </DashboardContent>
    );
}