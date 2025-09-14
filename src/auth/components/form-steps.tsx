'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWatch, useFormContext } from 'react-hook-form';

import Step from '@mui/material/Step';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import { type Theme, type SxProps } from '@mui/material/styles';
import { Grid, Link, Stack, Alert, Button, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useShipping } from 'src/contexts/shipping-context';

import { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

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
            <Typography sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: 36 }}>
                Szia!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Kérjük add meg a szerepkörödet.
            </Typography>
            <RHFSelect name="stepOne.role" label="Magánszemély vagy cég?">
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
            <Typography variant="h4" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: 36 }}>
                Add meg az adataid
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Kérjük add meg az alapadataid a regisztrációhoz.
            </Typography>

            <Stack spacing={2.5}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', px: 2 }}>
                    A &quot;Tovább&quot; gomb megnyomásával elfogadod az <Link underline="always" color="text.primary" href="/#" target="_blank" sx={{ fontWeight: 600 }}>
                        Általános szerződési feltételeket
                    </Link> és az <Link underline="always" color="text.primary" href="/#" target="_blank" sx={{ fontWeight: 600 }}>
                        Adatvédelmi nyilatkozatot
                    </Link>.
                </Typography>

                {isCompany && (
                    <>
                        <RHFTextField name="stepTwo.companyName" label="Cég neve" />
                        <RHFTextField name="stepTwo.taxNumber" label="Adószám" />
                    </>
                )}
                <RHFTextField name="stepTwo.firstName" label="Vezetéknév" />
                <RHFTextField name="stepTwo.lastName" label="Keresztnév" />
                <RHFTextField name="stepTwo.email" label="E-mail cím" />
                <RHFTextField name="stepTwo.email2" label="E-mail cím még egyszer" />
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
            <Typography variant="h4" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: 36 }}>
                Cím adatok
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
                    <Grid size={{ xs: 12, md: 3 }}>
                        <RHFTextField
                            name="stepThree.zipCode"
                            label="Irányítószám"
                            type="tel"
                            inputProps={{ maxLength: 4 }}
                            onBlur={handleZipCodeBlur}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <RHFTextField name="stepThree.city" label="Település" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <RHFTextField name="stepThree.street" label="Közterület neve" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <RHFTextField name="stepThree.houseNumber" label="Házszám" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <RHFTextField name="stepThree.floorDoor" label="Emelet, ajtó" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <RHFTextField name="stepThree.doorBell" label="Kapucsengő" />
                    </Grid>
                </Grid>
                <RHFTextField
                    name="stepThree.phone"
                    label="Telefonszám"
                    type="tel"
                    placeholder="+36"
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
    const router = useRouter();

    const handleGoToLogin = () => {
        router.push(paths.auth.supabase.signIn);
    };

    return (
        <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ flexGrow: 1 }}>
            <Typography variant="h4">Köszönjük a regisztrációt!</Typography>
            <Button variant="outlined" color="inherit" onClick={handleGoToLogin}>
                Bejelentkezés
            </Button>
        </Stack>
    );
}
