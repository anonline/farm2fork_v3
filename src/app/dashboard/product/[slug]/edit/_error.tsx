'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------
type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ProductEditError({error, reset}: Readonly<Props>) {
    return (
        <DashboardContent sx={{ pt: 5 }}>
            <EmptyContent
                filled
                title="Product could not be opened to edit!"
                description={error.message}
                action={
                    <Button
                        component={RouterLink}
                        href={paths.dashboard.product.root}
                        startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
                        sx={{ mt: 3 }}
                    >
                        Back to list
                    </Button>
                }
                sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
            />
        </DashboardContent>
    );
}
