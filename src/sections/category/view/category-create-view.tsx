'use client';

import type { ICategoryItem } from 'src/types/category';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryNewEditForm } from '../category-new-edit-form';

// ----------------------------------------------------------------------

export function CategoryCreateView({
    maxFileSize = 5,
    allCategories,
}: {
    maxFileSize?: number;
    allCategories: ICategoryItem[];
}) {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Új kategória"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termék kategória', href: paths.dashboard.product.categories.root },
                    { name: 'Új kategória' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <CategoryNewEditForm allCategories={allCategories} />
        </DashboardContent>
    );
}
