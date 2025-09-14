'use client';

import { Box, Stack, Container } from '@mui/material';

import { SignUpWizard } from 'src/auth/components/sign-up-wizard';

// ----------------------------------------------------------------------

export default function SupabaseSignUpView() {
    return (
        <Container sx={{ marginRight: 'auto', paddingY: 5 }}>
            <Box
                display="flex"
                sx={{
                    gap: { xs: 4, md: 6 },
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Stack
                    sx={{
                        width: '100%',
                        mx: 'auto',
                        p: 0,
                        
                    }}
                >
                    <SignUpWizard />
                </Stack>

                <Illustration />
            </Box>
        </Container>
    );
}

export function Illustration() {
    return (
        <Box
            sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                
                color: 'common.white',
                backgroundColor: 'common.white',
            }}
        >
            <Box
                component="img"
                alt="Farm2Fork regisztráció"
                src="/assets/images/sign-up/SignUp.webp"
                sx={{ maxWidth: 600 }}
            />
        </Box>
    );
}
