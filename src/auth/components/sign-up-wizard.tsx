'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useCallback } from 'react';

import { Box, Stack, Button } from '@mui/material';

import { registerUser } from 'src/actions/auth';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { StepOne, StepTwo, Stepper, StepThree, StepCompleted } from './form-steps';

// ----------------------------------------------------------------------

export type RegistrationSchemaType = zod.infer<ReturnType<typeof getRegistrationSchema>>;

const getRegistrationSchema = () => {
    const StepOneSchema = zod.object({
        role: zod.enum(['private', 'company'], {
            required_error: 'Kérjük, válassza ki a szerepkörét!',
        }),
    });

    const StepTwoSchema = zod
        .object({
            companyName: zod.string().optional(),
            taxNumber: zod.string().optional(),
            firstName: zod.string().min(1, { message: 'Vezetéknév megadása kötelező!' }),
            lastName: zod.string().min(1, { message: 'Keresztnév megadása kötelező!' }),
            email: zod
                .string()
                .min(1, { message: 'E-mail cím megadása kötelező!' })
                .email({ message: 'Érvénytelen e-mail cím formátum!' }),
            password: zod
                .string()
                .min(8, { message: 'A jelszónak legalább 8 karakter hosszúnak kell lennie!' }),
            passwordConfirm: zod.string(),
            newsletter: zod.boolean(),
        })
        .refine((data) => data.password === data.passwordConfirm, {
            message: 'A két jelszó nem egyezik!',
            path: ['passwordConfirm'],
        });

    const StepThreeSchema = zod.object({
        fullName: zod.string().optional(),
        zipCode: zod
            .string()
            .regex(/^\d*$/, { message: 'Az irányítószám csak számokat tartalmazhat.' })
            .max(4, { message: 'Az irányítószám maximum 4 karakter lehet.' })
            .optional(),
        city: zod.string().optional(),
        streetAddress: zod.string().optional(),
        floorDoor: zod.string().optional(),
        phone: zod
            .string()
            .refine(
                (val) => {
                    if (val === '' || !val) return true;
                    return /^\+36\d{9}$/.test(val);
                },
                {
                    message: 'Érvénytelen telefonszám formátum! (Pl: +36301234567)',
                }
            )
            .optional(),
        comment: zod.string().optional(),
        source: zod.string().optional(),
    });

    return zod
        .object({
            stepOne: StepOneSchema,
            stepTwo: StepTwoSchema,
            stepThree: StepThreeSchema,
        })
        .superRefine((data, ctx) => {
            if (data.stepOne.role === 'company') {
                if (!data.stepTwo.companyName) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Cégnév megadása kötelező!',
                        path: ['stepTwo', 'companyName'],
                    });
                }
                if (!data.stepTwo.taxNumber) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Adószám megadása kötelező!',
                        path: ['stepTwo', 'taxNumber'],
                    });
                }
            }
        });
};

const STEPS = ['Szerepkör', 'Alapadatok', 'Szállítási adatok'];

export function SignUpWizard() {
    const [activeStep, setActiveStep] = useState(0);

    const RegistrationSchema = useMemo(() => getRegistrationSchema(), []);

    const defaultValues = {
        stepOne: { role: 'private' as const },
        stepTwo: {
            companyName: '',
            taxNumber: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
            newsletter: false,
        },
        stepThree: {
            fullName: '',
            zipCode: '',
            city: '',
            streetAddress: '',
            floorDoor: '',
            phone: '',
            comment: '',
            source: '',
        },
    };

    const methods = useForm<RegistrationSchemaType>({
        mode: 'onChange',
        resolver: zodResolver(RegistrationSchema),
        defaultValues,
    });

    const {
        reset,
        trigger,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const handleNext = useCallback(
        async (step?: 'stepOne' | 'stepTwo' | 'stepThree') => {
            const isValid = await trigger(step);
            if (isValid) {
                setActiveStep((prev) => prev + 1);
            }
        },
        [trigger]
    );

    const handleBack = useCallback(() => {
        setActiveStep((prev) => prev - 1);
    }, []);
    const handleReset = useCallback(() => {
        reset();
        setActiveStep(0);
    }, [reset]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            await registerUser(data);
            toast.success('Sikeres regisztráció!');
            setActiveStep((prev) => prev + 1);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Hiba történt a regisztráció során.');
        }
    });

    return (
        <Stack sx={{ width: 1 }}>
            <Stepper steps={STEPS} activeStep={activeStep} sx={{ mb: 3 }} />
            <Form methods={methods} onSubmit={onSubmit}>
                <Box sx={{ minHeight: { xs: 360, md: 400 } }}>
                    {activeStep === 0 && <StepOne />}
                    {activeStep === 1 && <StepTwo />}
                    {activeStep === 2 && <StepThree />}
                    {activeStep === STEPS.length && <StepCompleted onReset={handleReset} />}
                </Box>

                {activeStep < STEPS.length && (
                    <Box
                        sx={{
                            display: 'flex',
                            mt: 3,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                        >
                            Vissza
                        </Button>
                        {activeStep === 0 && (
                            <Button
                                size="large"
                                variant="contained"
                                color="inherit"
                                onClick={() => handleNext('stepOne')}
                            >
                                Tovább
                            </Button>
                        )}
                        {activeStep === 1 && (
                            <Button
                                size="large"
                                variant="contained"
                                color="inherit"
                                onClick={() => handleNext('stepTwo')}
                            >
                                Tovább
                            </Button>
                        )}
                        {activeStep === 2 && (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    color="inherit"
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    Később adom meg
                                </Button>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="inherit"
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    Tovább
                                </Button>
                            </Stack>
                        )}
                    </Box>
                )}
            </Form>
        </Stack>
    );
}
