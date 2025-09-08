'use client';

import type { ICategoryItem } from 'src/types/category';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryNewEditForm } from '../category-new-edit-form';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks/use-router';
import Link from 'next/link';



// ----------------------------------------------------------------------

type Props = {
    category?: ICategoryItem;
    maxFileSize?: number;
    allCategories?: ICategoryItem[];
};

export default function CategoryEditView({ category, maxFileSize = 5, allCategories }: Props) {
    const router = useRouter();

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
                action={
                    <Link href={paths.categories.list(category?.slug || '')} passHref target="_blank">
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Megnyitás
                        </Button>
                    </Link>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <CategoryNewEditForm
                currentCategory={category}
                maxFileSize={maxFileSize}
                allCategories={allCategories}
            />
        </DashboardContent>
    );
}
