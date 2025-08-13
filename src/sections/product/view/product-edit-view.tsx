'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';

import { useProduct } from 'src/contexts/product-context';

// ----------------------------------------------------------------------

export function ProductEditView() {
    const { product } = useProduct();

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading={product?.name + ' szerkesztése'}
                backHref={paths.dashboard.product.root}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termék', href: paths.dashboard.product.root },
                    { name: 'Szerkesztés' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <ProductNewEditForm currentProduct={product} />
        </DashboardContent>
    );
}
