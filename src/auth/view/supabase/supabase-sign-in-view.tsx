'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
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
import { Illustration } from './supabase-sign-up-view';
import { signInWithPassword } from '../../context/supabase';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

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

// ----------------------------------------------------------------------

export function SupabaseSignInView() {
    const router = useRouter();

    const showPassword = useBoolean();

    const { checkUserSession } = useAuthContext();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const defaultValues: SignInSchemaType = {
        email: '',
        password: '',
    };

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
            const feedbackMessage = 'Hiba történt a bejelentkezés során!';
            // const feedbackMessage = getErrorMessage(error);
            setErrorMessage(feedbackMessage);
        }
    });

    const renderForm = () => (
        <>
            <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                <Field.Text
                    name="email"
                    label="Email"
                    placeholder="Add meg az e-mail címed..."
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
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
                                        <IconButton onClick={showPassword.onToggle} edge="end">
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
                </Box>

                <Button
                    fullWidth
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    loadingIndicator="Bejelentkezés folyamatban"
                >
                    Bejelentkezés
                </Button>
                <Link
                    component={RouterLink}
                    href={paths.auth.supabase.resetPassword}
                    variant="body2"
                    color="inherit"
                    sx={{
                        alignSelf: 'flex-stretch',
                        alignItems: 'center',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    Elfelejtett jelszó
                </Link>
            </Box>
            <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column', mt: 5 }}>
                <Typography variant="h5">Nincs még fiókod?</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Regisztrálj oldalunkon, hogy megismerhessük egymást.
                </Typography>

                <Button
                    fullWidth
                    color="info"
                    size="large"
                    type="button"
                    variant="outlined"
                    loading={isSubmitting}
                    loadingIndicator=""
                    href={paths.auth.supabase.signUp}
                    component={RouterLink}
                >
                    Regisztráció
                </Button>
            </Box>
        </>
    );

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}>
            <Box sx={{width:'450px', marginY:5}}>
                <FormHead
                    title="Belépés"
                    
                    sx={{ textAlign: { xs: 'center', md: 'left' }, }}
                />

                {!!errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errorMessage}
                    </Alert>
                )}

                <Form methods={methods} onSubmit={onSubmit}>
                    {renderForm()}
                </Form>
            </Box>
            <Box>
                <Illustration />
            </Box>
        </Container>
    );
}
