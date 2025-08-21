'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { SignUpWizard } from 'src/auth/components/sign-up-wizard';

// ----------------------------------------------------------------------


export function SupabaseSignUpView() {
    return (
        <Container
            maxWidth="xl"
            disableGutters
            sx={{
                justifyContent: 'center',
            }}
        >
            <Card sx={{ display: 'flex', flex: 1, borderRadius: 0 }}>
                <Stack
                    sx={{
                        p: 4,
                        width: 1,
                        mx: 'auto',
                        maxWidth: 480,
                        justifyContent: 'center',
                    }}
                >
                    <SignUpWizard />
                </Stack>
            </Card>
        </Container>
    );
}

