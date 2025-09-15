'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export default function ErrorPage({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    console.error(error);
    return (
        <DashboardContent maxWidth={false}>
            <EmptyContent
                filled
                title="Összesítő nem található!"
                action={
                    <Button
                        component={RouterLink}
                        href={paths.dashboard.shipments.root}
                        startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
                        sx={{ mt: 3 }}
                    >
                        Vissza a listához
                    </Button>
                }
                sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
            />
        </DashboardContent>
    );
}
