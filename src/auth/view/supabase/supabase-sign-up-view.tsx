'use client';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { SignUpWizard } from 'src/auth/components/sign-up-wizard';

// ----------------------------------------------------------------------

export function SupabaseSignUpView() {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
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
      
    </Container>
  );
}
