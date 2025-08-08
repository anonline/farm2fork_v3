'use client';

import type { ICategoryItem } from 'src/types/category';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryNewEditForm } from '../category-new-edit-form';



// ----------------------------------------------------------------------

type Props = {
    category?: ICategoryItem;
    maxFileSize?: number;
    allCategories?: ICategoryItem[];
};

export default function CategoryEditView({ category, maxFileSize = 5, allCategories }: Props) {
    
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Szerkesztés"
                backHref={paths.dashboard.product.categories.root}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termék kategóriák', href: paths.dashboard.product.categories.root },
                    { name: category?.name },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <CategoryNewEditForm currentCategory={category} maxFileSize={maxFileSize} allCategories={allCategories} />
        </DashboardContent>
    );
}
