'use client';

import { Button } from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProduct } from 'src/contexts/product-context';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';

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
                action={
                    product?.url && (<Button variant="contained" color="primary" href={paths.product.details(product?.url)} target="_blank" rel="noopener" disabled={!product}>
                        Megtekintés
                    </Button>)
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <ProductNewEditForm currentProduct={product} />
        </DashboardContent>
    );
}
