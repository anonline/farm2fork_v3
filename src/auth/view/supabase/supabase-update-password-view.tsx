'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import Container from 'node_modules/@mui/material/esm/Container/Container';

import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { Illustration } from './supabase-sign-up-view';
import { signOut, updatePassword } from '../../context/supabase';

// ----------------------------------------------------------------------

export type UpdatePasswordSchemaType = zod.infer<typeof UpdatePasswordSchema>;

export const UpdatePasswordSchema = zod
    .object({
        password: zod
            .string()
            .min(1, { message: 'Jelszó megadása kötelező!' })
            .min(8, { message: 'Jelszónak legalább 8 karakter hosszúnak kell lennie!' }),
        confirmPassword: zod.string().min(1, { message: 'Jelszó megerősítése kötelező!' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'A jelszavaknak meg kell egyezniük!',
        path: ['confirmPassword'],
    });

// ----------------------------------------------------------------------

export function SupabaseUpdatePasswordView() {
    const router = useRouter();

    const showPassword = useBoolean();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const defaultValues: UpdatePasswordSchemaType = {
        password: '',
        confirmPassword: '',
    };

    const methods = useForm<UpdatePasswordSchemaType>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await updatePassword({ password: data.password });
            await signOut();
            router.push(paths.auth.supabase.signIn);
        } catch (error) {
            console.error(error);
            const feedbackMessage = getErrorMessage(error);
            let hungarianMessage = feedbackMessage;
            switch (feedbackMessage.trim()) {
                case 'New password should be different from the old password.':
                    hungarianMessage = 'Az új jelszónak különböznie kell a régi jelszótól.';
                    break;
                case 'Password should be at least 8 characters':
                    hungarianMessage = 'A jelszónak legalább 8 karakter hosszúnak kell lennie.';
                    break;
                default:
                    hungarianMessage = feedbackMessage;
            }
            setErrorMessage(hungarianMessage);
        }
    });

    const renderForm = () => (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Field.Text
                name="password"
                label="Jelszó"
                placeholder="8+ karakter"
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

            <Field.Text
                name="confirmPassword"
                label="Jelszó megerősítése"
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

            <Button
                fullWidth
                type="submit"
                size="large"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Folyamatban..."
            >
                Jelszó mentése
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
                        title="Új jelszó beállítása"
                        description="Kérjük, add meg az új jelszavad."
                    />

                    {!!errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Form methods={methods} onSubmit={onSubmit}>
                        {renderForm()}
                    </Form>
                </Stack>
                <Illustration />
            </Box>
        </Container>
    );
}
