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
          gap: { xs: 4, md: 8 }, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Stack
          sx={{
            width: 1,
            mx: 'auto',
            maxWidth: 480,
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
                paddingLeft: 5,
                color: 'common.white',
                backgroundColor: 'common.white',
            }}
        >
            <Box
                component="img"
                alt="Sign Up Picture"
                src="/assets/images/sign-up/SignUp.webp"
                sx={{ maxWidth: 600 }}
            />
        </Box>
    );
}
