'use client';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

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
        <Container sx={{ mt: 5, mb: 10 }}>
            <EmptyContent
                filled
                title={'Product not found! ' + error}
                action={
                    <Button
                        component={RouterLink}
                        href={paths.product.root}
                        startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
                        sx={{ mt: 3 }}
                    >
                        Back to list
                    </Button>
                }
                sx={{ py: 10 }}
            />
        </Container>
    );
}
