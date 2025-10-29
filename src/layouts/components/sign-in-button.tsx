import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }: ButtonProps) {
    const { t } = useTranslate();
    return (
        <Button
            component={RouterLink}
            href={paths.auth.supabase.signIn}
            variant="contained"
            color="primary"
            sx={sx}
            {...other}
        >
            { t('signin_btn_label') }
        </Button>
    );
}
