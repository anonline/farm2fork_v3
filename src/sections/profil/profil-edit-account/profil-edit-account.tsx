import { useState } from 'react';

import {
    Box,
    Grid,
    Stack,
    Button,
    Checkbox,
    TextField,
    Typography,
    FormControlLabel,
} from '@mui/material';

import EditAccountPassword from './edit-account-password';

export default function ProfilEditAccount() {
    const [companyName, setCompanyName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const mainTitleStyle = {
        fontSize: '32px',
        fontWeight: 700,
        lineHeight: '44px',
    };

    const sectionTitleStyle = {
        fontSize: '20px',
        fontWeight: 700,
        lineHeight: '28px',
    };

    const formInputStyle = {
        '& .MuiOutlinedInput-input': {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '28px',
        },
    };

    const newsletterLabelStyle = {
        fontSize: '14px',
        fontWeight: 400,
        letterSpacing: '0.14px',
        lineHeight: '28px',
    };

    const requiredFieldSx = {
        '& .MuiFormLabel-asterisk': { color: 'red' },
    };

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
            <Typography sx={{ ...mainTitleStyle, mb: 4 }}>Profiladatok</Typography>
            <Stack spacing={3} component="form" noValidate autoComplete="off">
                <Typography sx={sectionTitleStyle}>Személyes adatok</Typography>

                <TextField
                    fullWidth
                    label="Cég neve"
                    variant="outlined"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    sx={formInputStyle}
                />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Vezetéknév"
                            variant="outlined"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            sx={{ ...formInputStyle, ...requiredFieldSx }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Keresztnév"
                            variant="outlined"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            sx={{ ...formInputStyle, ...requiredFieldSx }}
                        />
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    required
                    label="Felhasználónév"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ ...formInputStyle, ...requiredFieldSx }}
                />
                <TextField
                    fullWidth
                    required
                    type="email"
                    label="E-mail cím"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ ...formInputStyle, ...requiredFieldSx }}
                />

                <Box sx={{ pt: 2 }} />

                <Typography sx={sectionTitleStyle}>Hírlevél</Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                        />
                    }
                    label="Igen, kérem, szeretnék feliratkozni a hírlevélre, és hozzájárulok, hogy a megadott e-mail címemre rendszeresen érkezzenek az újdonságok és ajánlatok. Elfogadom az Adatvédelmi és Felhasználási feltételeket."
                    sx={{ '& .MuiTypography-root': newsletterLabelStyle }}
                />
            </Stack>

            <Box sx={{ my: 4 }} />

            <Stack spacing={3}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', ...sectionTitleStyle }}>
                    Jelszó módosítása
                </Typography>

                <EditAccountPassword
                    label="Régi jelszó (hagyd üresen, ha nem kívánod módosítani)"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <EditAccountPassword
                    label="Új jelszó (hagyd üresen, ha nem kívánod módosítani)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <EditAccountPassword
                    label="Az új jelszó megerősítése"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: 'rgb(70, 110, 80)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgb(60, 90, 65)',
                            },
                        }}
                    >
                        Mentés
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
