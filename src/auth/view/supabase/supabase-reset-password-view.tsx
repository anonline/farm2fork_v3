'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from 'node_modules/@mui/material/esm/Stack/Stack';
import Container from 'node_modules/@mui/material/esm/Container/Container';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { resetPassword } from '../../context/supabase';
import { Illustration } from './supabase-sign-up-view';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod.object({
    email: zod
        .string()
        .min(1, { message: 'Email is required!' })
        .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function SupabaseResetPasswordView() {
    const router = useRouter();

    const defaultValues: ResetPasswordSchemaType = {
        email: '',
    };

    const methods = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await resetPassword({ email: data.email });

            router.push(paths.auth.supabase.verify);
        } catch (error) {
            console.error(error);
        }
    });

    const renderForm = () => (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Field.Text
                autoFocus
                name="email"
                label="E-mail cím"
                placeholder="példa@gmail.com"
                slotProps={{ inputLabel: { shrink: true } }}
            />

            <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Kérés küldése..."
            >
                Új jelszó kérése
            </Button>
        </Box>
    );

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
                        icon={<Iconify icon="solar:lock-password-outline" width={64} />}
                        title="Elfelejtetted a jelszavad?"
                        description="Kérjük, add meg a fiókodhoz kapcsolódó email címet, és küldünk egy linket a jelszavad visszaállításához."
                    />

                    <Form methods={methods} onSubmit={onSubmit}>
                        {renderForm()}
                    </Form>
                    <FormReturnLink href={paths.auth.supabase.signIn} sx={{ mt: 5 }} />

                </Stack>
                <Illustration />
            </Box>

        </Container>
    );
}
