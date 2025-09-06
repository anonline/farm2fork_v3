import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }: ButtonProps) {
    return (
        <Button
            component={RouterLink}
            href={paths.auth.supabase.signIn}
            variant="contained"
            color="primary"
            sx={sx}
            {...other}
        >
            Belépés
        </Button>
    );
}
