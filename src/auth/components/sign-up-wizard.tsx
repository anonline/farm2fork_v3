'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Button } from '@mui/material';

import { registerUser } from 'src/actions/auth';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { StepOne, StepTwo, Stepper, StepThree, StepCompleted } from './form-steps';

// A Zod sémák és a típus exportálása, hogy más fájlok is elérhessék
export const StepOneSchema = zod.object({
  role: zod.enum(['private', 'company'], { required_error: 'Kérjük, válassza ki a szerepkörét!' }),
});

export const StepTwoSchema = zod
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

export const StepThreeSchema = zod.object({
  fullName: zod.string().min(1, { message: 'Teljes név megadása kötelező!' }),
  zipCode: zod.string().min(1, { message: 'Irányítószám megadása kötelező!' }),
  city: zod.string().min(1, { message: 'Település megadása kötelező!' }),
  streetAddress: zod.string().min(1, { message: 'Utca és házszám megadása kötelező!' }),
  floorDoor: zod.string().optional(),
  phone: zod
    .string()
    .regex(/^\+36\d{9}$/, { message: 'Érvénytelen telefonszám formátum! (Pl: +36301234567)' }),
  comment: zod.string().optional(),
  source: zod.string().optional(),
});

export const RegistrationSchema = zod
  .object({
    stepOne: StepOneSchema,
    stepTwo: StepTwoSchema,
    stepThree: StepThreeSchema,
  })
  .superRefine((data, ctx) => {
    if (data.stepOne.role === 'company') {
      if (!data.stepTwo.companyName) {
        ctx.addIssue({ code: 'custom', message: 'Cégnév megadása kötelező!', path: ['stepTwo', 'companyName'] });
      }
      if (!data.stepTwo.taxNumber) {
        ctx.addIssue({ code: 'custom', message: 'Adószám megadása kötelező!', path: ['stepTwo', 'taxNumber'] });
      }
    }
  });

export type RegistrationSchemaType = zod.infer<typeof RegistrationSchema>;

const STEPS = ['Szerepkör', 'Alapadatok', 'Cím adatok'];

export function SignUpWizard() {
  const [activeStep, setActiveStep] = useState(0);

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

  const { reset, trigger, handleSubmit, formState: { isSubmitting } } = methods;

  const handleNext = useCallback(async (step?: 'stepOne' | 'stepTwo' | 'stepThree') => {
    const isValid = await trigger(step);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  }, [trigger]);

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
      handleNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Hiba történt a regisztráció során.');
    }
  });

  return (
    <>
      <Stepper steps={STEPS} activeStep={activeStep} sx={{ mb: 3 }} />
      <Form methods={methods} onSubmit={onSubmit}>
        <Box sx={{ minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          {activeStep === 0 && <StepOne />}
          {activeStep === 1 && <StepTwo />}
          {activeStep === 2 && <StepThree />}
          {activeStep === STEPS.length && <StepCompleted onReset={handleReset} />}
        </Box>

        {activeStep < STEPS.length && (
          <Box sx={{ display: 'flex', mt: 3, justifyContent: activeStep === 0 ? 'flex-end' : 'space-between' }}>
            <Button onClick={handleBack} disabled={activeStep === 0} sx={{ ...(activeStep === 0 && { display: 'none' }) }}>
              Vissza
            </Button>
            
            {activeStep === 0 && <Button fullWidth size="large" variant="contained" color="inherit" onClick={() => handleNext('stepOne')}>Tovább</Button>}
            {activeStep === 1 && <Button fullWidth size="large" variant="contained" color="inherit" onClick={() => handleNext('stepTwo')}>Tovább</Button>}
            {activeStep === 2 && <Button fullWidth size="large" type="submit" variant="contained" color="inherit" loading={isSubmitting}>Regisztráció</Button>}
          </Box>
        )}
      </Form>
    </>
  );
}