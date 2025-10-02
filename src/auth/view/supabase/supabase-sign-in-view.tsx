'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Container, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { signInWithPassword, signInWithWordpress } from '../../context/supabase';

// ----------------------------------------------------------------------

function Illustration() {
    return (
        <Box
            sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                component="img"
                alt="Sign In Picture"
                src="/assets/images/sign-up/SignUp.webp" // Ellenőrizd, hogy az elérési út helyes-e
                sx={{ maxWidth: { lg: 480, xl: 600 } }}
            />
        </Box>
    );
}

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
    email: zod
        .string()
        .min(1, { message: 'Email kitöltése kötelező!' })
        .email({ message: 'Email formátuma nem megfelelő!' }),
    password: zod
        .string()
        .min(1, { message: 'Jelszó kitöltése kötelező!' })
        .min(6, { message: 'A jelszó legalább 6 karakter hosszúnak kell lennie!' }),
});

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

// ----------------------------------------------------------------------

export function SupabaseSignInView() {
    const router = useRouter();
    const showPassword = useBoolean();
    const { checkUserSession } = useAuthContext();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const defaultValues: SignInSchemaType = { email: '', password: '' };

    const methods = useForm<SignInSchemaType>({
        resolver: zodResolver(SignInSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await signInWithPassword({ email: data.email, password: data.password });
            await checkUserSession?.();
            router.refresh();
        } catch (error) {
            console.error(error);
            setErrorMessage('Adatok ellenőrzése folyamatban...');
            const wpLogin = await signInWithWordpress({ email: data.email, password: data.password });
            console.error(wpLogin);
            if(wpLogin) {
                setErrorMessage('');
                await checkUserSession?.();
                router.refresh();
            } else {
                setErrorMessage('Hibás e-mail cím vagy jelszó.');
            }
        }
    });

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
                        title="Belépés"
                        sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 5 }}
                    />

                    {!!errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Form methods={methods} onSubmit={onSubmit}>
                        <Stack spacing={2.5}>
                            <Field.Text
                                name="email"
                                label="Email"
                                placeholder="Add meg az e-mail címed..."
                                slotProps={{ inputLabel: { shrink: true } }}
                            />

                            <Field.Text
                                name="password"
                                label="Jelszó"
                                placeholder="Addj meg egy jelszót"
                                type={showPassword.value ? 'text' : 'password'}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={showPassword.onToggle}
                                                    edge="end"
                                                >
                                                    <Iconify
                                                        icon={
                                                            showPassword.value
                                                                ? 'solar:eye-bold'
                                                                : 'solar:eye-closed-bold'
                                                        }
                                                    />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Link
                                component={RouterLink}
                                href={paths.auth.supabase.resetPassword}
                                variant="body2"
                                color="inherit"
                                sx={{ alignSelf: 'flex-end' }}
                            >
                                Elfelejtett jelszó
                            </Link>

                            <Button
                                fullWidth
                                color="inherit"
                                size="large"
                                type="submit"
                                variant="contained"
                                loading={isSubmitting}
                                loadingIndicator="Bejelentkezés folyamatban..."
                            >
                                Bejelentkezés
                            </Button>
                        </Stack>
                    </Form>

                    <Stack spacing={2} sx={{ mt: 5 }}>
                        <Typography variant="h6">Nincs még fiókod?</Typography>
                        <Button
                            fullWidth
                            component={RouterLink}
                            href={paths.auth.supabase.signUp}
                            color="inherit"
                            size="large"
                            variant="outlined"
                        >
                            Regisztráció
                        </Button>
                    </Stack>
                </Stack>

                <Illustration />
            </Box>
        </Container>
    );
}
