'use client';

import { useState, useEffect } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';

import Step from '@mui/material/Step';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import { type Theme, type SxProps } from '@mui/material/styles';
import { Grid, Link, Stack, Alert, Button, MenuItem, Typography } from '@mui/material';

import { useShipping } from 'src/contexts/shipping-context';

import { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { paths } from 'src/routes/paths';
import router from 'next/router';

// ----------------------------------------------------------------------

type StepperProps = {
    steps: string[];
    activeStep: number;
    sx?: SxProps<Theme>;
};

export function Stepper({ steps, activeStep, sx }: Readonly<StepperProps>) {
    return (
        <MuiStepper alternativeLabel activeStep={activeStep} sx={sx}>
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel
                        sx={{
                            '& .MuiStepLabel-label': {
                                typography: 'subtitle2',
                                '&.Mui-active, &.Mui-completed': {
                                    fontWeight: 'fontWeightSemiBold',
                                },
                            },
                        }}
                    >
                        {label}
                    </StepLabel>
                </Step>
            ))}
        </MuiStepper>
    );
}

// --- Első lépés: Szerepkör választás ---
export function StepOne() {
    return (
        <>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Szia!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Kérjük add meg a szerepkörödet.
            </Typography>
            <RHFSelect name="stepOne.role" label="Szerepkör">
                <MenuItem value="private">Magánszemély</MenuItem>
                <MenuItem value="company">Cég</MenuItem>
            </RHFSelect>
        </>
    );
}

// --- Második lépés: Alapadatok ---
export function StepTwo() {
    const { control } = useFormContext();
    const role = useWatch({ control, name: 'stepOne.role' });
    const isCompany = role === 'company';

    return (
        <>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Add meg az adataid
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Kérjük add meg az alapadataid a regisztrációhoz.
            </Typography>
            <Stack spacing={2.5}>
                {isCompany && (
                    <>
                        <RHFTextField name="stepTwo.companyName" label="Cég neve" />
                        <RHFTextField name="stepTwo.taxNumber" label="Adószám" />
                    </>
                )}
                <RHFTextField name="stepTwo.firstName" label="Vezetéknév" />
                <RHFTextField name="stepTwo.lastName" label="Keresztnév" />
                <RHFTextField name="stepTwo.email" label="E-mail cím" />
                <RHFTextField name="stepTwo.password" type="password" label="Jelszó" />
                <RHFTextField
                    name="stepTwo.passwordConfirm"
                    type="password"
                    label="Jelszó mégegyszer"
                />
                <RHFSwitch
                    name="stepTwo.newsletter"
                    label="Szeretnék feliratkozni a hírlevelekre."
                />
            </Stack>

            <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 3, textAlign: 'center' }}
            >
                A &quot;Tovább&quot; gomb megnyomásával elfogadod az{' '}
                <Link underline="always" color="text.primary" href="/#" target="_blank">
                    Általános szerződési feltételeket
                </Link>{' '}
                és az{' '}
                <Link underline="always" color="text.primary" href="/#" target="_blank">
                    Adatvédelmi nyilatkozatot
                </Link>
                .
            </Typography>
        </>
    );
}

// --- Harmadik lépés: Szállítási adatok ---
export function StepThree() {
    const { watch, setValue } = useFormContext();
    const { shippingZones } = useShipping();
    const [showDeliveryWarning, setShowDeliveryWarning] = useState(false);

    const firstName = watch('stepTwo.firstName');
    const lastName = watch('stepTwo.lastName');

    useEffect(() => {
        if (firstName && lastName) {
            setValue('stepThree.fullName', `${firstName} ${lastName}`, { shouldValidate: true });
        }
    }, [firstName, lastName, setValue]);

    const handleZipCodeBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const zipCode = event.target.value;
        if (zipCode && shippingZones.length > 0) {
            const isDeliverable = shippingZones.some((zone) => zone.Iranyitoszam === zipCode);
            setShowDeliveryWarning(!isDeliverable);
        } else {
            setShowDeliveryWarning(false);
        }
    };

    return (
        <>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Szállítási adatok
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Kérjük add meg a címadataid a kiszállításhoz.
            </Typography>
            <Stack spacing={2.5}>
                {showDeliveryWarning && (
                    <Alert severity="warning">
                        Sajnáljuk, erre az irányítószámra jelenleg nem szállítunk. A regisztrációt
                        befejezheted, de csak személyes átvételt tudsz majd választani.
                    </Alert>
                )}
                <RHFTextField name="stepThree.fullName" label="Teljes név" />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <RHFTextField
                            name="stepThree.zipCode"
                            label="Irányítószám"
                            type="tel" // HOZZÁADVA
                            inputProps={{ maxLength: 4 }}
                            onBlur={handleZipCodeBlur}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <RHFTextField name="stepThree.city" label="Település" />
                    </Grid>
                </Grid>
                <RHFTextField name="stepThree.streetAddress" label="Utca, házszám" />
                <RHFTextField
                    name="stepThree.floorDoor"
                    label="Emelet, ajtó, egyéb (nem kötelező)"
                />
                <RHFTextField
                    name="stepThree.phone"
                    label="Telefonszám"
                    type="tel"
                    placeholder="+36..."
                />
                <RHFTextField
                    name="stepThree.comment"
                    multiline
                    rows={3}
                    label="Megjegyzés a szállításhoz (nem kötelező)"
                />
                <RHFTextField name="stepThree.source" label="Honnan hallottál rólunk?" />
            </Stack>
        </>
    );
}

// --- Befejező lépés: Sikeres regisztráció ---
export function StepCompleted({ onReset }: Readonly<{ onReset: () => void }>) {
    return (
        <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ flexGrow: 1 }}>
            <Typography variant="h4">Köszönjük a regisztrációt!</Typography>
            <Button variant="outlined" color="inherit" onClick={()=>{router.push(paths.auth.supabase.signIn);}}>
                Bejelentkezés
            </Button>
        </Stack>
    );
}
