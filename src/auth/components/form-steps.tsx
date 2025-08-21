import { useWatch, useFormContext } from 'react-hook-form';

import Step from '@mui/material/Step';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import { type Theme, type SxProps } from '@mui/material/styles';
import { Grid, Stack, Button, MenuItem, Typography } from '@mui/material';

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


export function StepOne() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Szia!
      </Typography>
      <Typography sx={{ mb: 3 }}>Kérjük add meg a szerepkörödet. Magánszemély vagy cég?</Typography>

      <RHFSelect name="stepOne.role" label="Szerepkör">
        <MenuItem value="private">Magánszemély</MenuItem>
        <MenuItem value="company">Cég</MenuItem>
      </RHFSelect>
    </>
  );
}


export function StepTwo() {
  const { control } = useFormContext();
  const role = useWatch({ control, name: 'stepOne.role' });
  const isCompany = role === 'company';

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add meg az adataid
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
        <RHFTextField name="stepTwo.passwordConfirm" type="password" label="Jelszó mégegyszer" />
        <RHFSwitch name="stepTwo.newsletter" label="Szeretnék feliratkozni a hírlevelekre." />
      </Stack>
    </>
  );
}


export function StepThree() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Cím adatok
      </Typography>
      <Stack spacing={2.5}>
        <RHFTextField name="stepThree.fullName" label="Teljes név" />
        <Grid container spacing={2}>
          <Grid size={{xs:12, md:6}}>
            <RHFTextField name="stepThree.zipCode" label="Irányítószám" />
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <RHFTextField name="stepThree.city" label="Település" />
          </Grid>
        </Grid>
        <RHFTextField name="stepThree.streetAddress" label="Utca, házszám" />
        <RHFTextField name="stepThree.floorDoor" label="Emelet, ajtó, egyéb (nem kötelező)" />
        <RHFTextField name="stepThree.phone" label="Telefonszám" placeholder="+36..." />
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


export function StepCompleted({ onReset }: Readonly<{ onReset: () => void }>) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ flexGrow: 1 }}>
      <Typography variant="h4">Köszönjük a regisztrációt!</Typography>
      <Typography>
        A fiókod sikeresen létrejött. A megerősítéshez kövesd az e-mailben küldött utasításokat.
      </Typography>
      <Button variant="outlined" color="inherit" onClick={onReset}>
        Új regisztráció
      </Button>
    </Stack>
  );
}