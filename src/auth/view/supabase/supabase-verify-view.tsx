'use client';

import { Box, Stack, Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { FormHead } from '../../components/form-head';
import { Illustration } from './supabase-sign-up-view';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export function SupabaseVerifyView() {
    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 200px)',
                paddingY: 5,
            }}
        >
            <Box
                display="flex"
                sx={{
                    width: 1,
                    maxWidth: 'lg',
                    gap: { xs: 4, md: 8 },
                    alignItems: 'center',
                }}
            >
                <Stack sx={{ width: 1, maxWidth: 450, marginRight: 'auto' }}>

                    <FormHead
                        icon={<Iconify icon="solar:letter-outline" width={64} />}
                        title="Ellenőrizd az email fiókodat!"
                        description={`Küldtünk egy 6-jegyű megerősítő kódot. \nKérjük, írd be a kódot az alábbi mezőbe az email címed megerősítéséhez.`}
                    />

                    <FormReturnLink href={paths.auth.supabase.signIn} sx={{ mb: 5 }} />

                </Stack>

                <Illustration />
            </Box>
        </Container>
    );
}
