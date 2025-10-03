import { paths } from "src/routes/paths";

import { DashboardContent } from "src/layouts/dashboard/content";

import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs/custom-breadcrumbs";

import WooImportStatusPage from "../woocommerce-status-card";
import WooCommerceImportStepper from "../woocommerce-import-stepper";

type Props = {
    status: any;
    products: any[];
    categories: any[];
    producers: any[];
    wpUsers: any[];
};

export default function WooImportPage({ status, products, categories, producers, wpUsers }: Readonly<Props>) {
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

            <WooCommerceImportStepper 
                wooCategories={categories} 
                wooProducers={producers} 
                wooProducts={products}
                wpUsers={wpUsers}
            />

        </DashboardContent>
    );
}