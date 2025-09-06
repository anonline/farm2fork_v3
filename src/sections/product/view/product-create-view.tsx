'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';

// ----------------------------------------------------------------------

export function ProductCreateView() {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Új termék hozzáadása"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termékek', href: paths.dashboard.product.root },
                    { name: 'Új termék' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <ProductNewEditForm currentProduct={null} />
        </DashboardContent>
    );
}
