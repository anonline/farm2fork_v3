'use client';


import { Box, Stack, Container } from '@mui/material';

import { SignUpWizard } from 'src/auth/components/sign-up-wizard';

// ----------------------------------------------------------------------

export default function SupabaseSignUpView() {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: 'flex',
        justifyContent: 'center',
        
      }}
    >
      <Box 
      display="flex"
      sx={{gap:2}}
      >
        <Stack
          sx={{
            p: { xs: 2, md: 4 }, 
            width: 1,
            mx: 'auto',
            maxWidth: 480,
            justifyContent: 'center',
          }}
        >
          <SignUpWizard/>
          
        </Stack>
      <Illustration/>
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
        p: 5,
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
