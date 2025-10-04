import { useState, useEffect } from 'react';

import {
    Box,
    Grid,
    Stack,
    Alert,
    Button,
    Checkbox,
    TextField,
    Typography,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';

import { supabase } from 'src/lib/supabase';
import { useGetCustomerData, updateCustomerData } from 'src/actions/customer';
import { updateUserEmailSSR } from 'src/actions/user-ssr';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/supabase/action';

import EditAccountPassword from './edit-account-password';

export default function ProfilEditAccount() {
    const { user } = useAuthContext();
    const { customerData, customerDataLoading } = useGetCustomerData(user?.id);

    const [companyName, setCompanyName] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [newsletter, setNewsletter] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load customer data when available
    useEffect(() => {
        if (customerData) {
            setFirstName(customerData.firstname || '');
            setLastName(customerData.lastname || '');
            setCompanyName(customerData.companyName || '');
            setNewsletter(customerData.newsletterConsent || false);
        }
    }, [customerData]);

    // Load user email
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        // Validation
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError('A vezetéknév, keresztnév és e-mail cím megadása kötelező.');
            return;
        }

        // Password validation if changing password
        if (newPassword || confirmPassword || oldPassword) {
            if (!oldPassword) {
                setError('Add meg a régi jelszavad a jelszó módosításához.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('Az új jelszavak nem egyeznek.');
                return;
            }
            if (newPassword.length < 6) {
                setError('Az új jelszónak legalább 6 karakter hosszúnak kell lennie.');
                return;
            }
        }

        setSaving(true);

        try {
            // Update customer data
            if (user?.id) {
                await updateCustomerData(user.id, {
                    firstname: firstName,
                    lastname: lastName,
                    companyName,
                    newsletterConsent: newsletter,
                    uid: user.id,
                });
            }

            // Update email if changed (without email confirmation)
            let emailChanged = false;
            if (user?.id && user?.email && email !== user.email) {
                await updateUserEmailSSR(user.id, email);
                emailChanged = true;
            }

            // Update password if provided
            let passwordChanged = false;
            if (newPassword && oldPassword) {
                // Verify old password by attempting to sign in
                try {
                    await signInWithPassword({ email: user?.email || email, password: oldPassword });
                    
                    // Update password
                    const { error: passwordError } = await supabase.auth.updateUser({
                        password: newPassword,
                    });
                    if (passwordError) throw passwordError;
                    
                    passwordChanged = true;
                    
                    // Clear password fields
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                } catch (passwordVerifyError) {
                    console.error('Password verification error:', passwordVerifyError);
                    throw new Error('A régi jelszó helytelen.');
                }
            }

            // Refresh session if email or password was changed to get new JWT token
            if (emailChanged || passwordChanged) {
                // First try to refresh the session
                const { error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                    console.error('Error refreshing session:', refreshError);
                }
                
                // If both email and password changed, or just password changed, sign in with new credentials
                if (passwordChanged) {
                    await signInWithPassword({ 
                        email: emailChanged ? email : (user?.email || email), 
                        password: newPassword 
                    });
                }
            }

            setSuccess('Profiladatok sikeresen mentve!');
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Hiba történt a mentés során.');
        } finally {
            setSaving(false);
        }
    };

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

    if (customerDataLoading) {
        return (
            <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
            <Typography sx={{ ...mainTitleStyle, mb: 4 }}>Profiladatok</Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Stack spacing={3} component="form" noValidate autoComplete="off">
                <Typography sx={sectionTitleStyle}>Személyes adatok</Typography>

                <TextField
                    fullWidth
                    label="Cég neve"
                    variant="outlined"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    sx={formInputStyle}
                    disabled={saving}
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
                            disabled={saving}
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
                            disabled={saving}
                        />
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    required
                    type="email"
                    label="E-mail cím"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ ...formInputStyle, ...requiredFieldSx }}
                    disabled={saving}
                />

                <Box sx={{ pt: 2 }} />

                <Typography sx={sectionTitleStyle}>Hírlevél</Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            disabled={saving}
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
                    disabled={saving}
                />
                <EditAccountPassword
                    label="Új jelszó (hagyd üresen, ha nem kívánod módosítani)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                />
                <EditAccountPassword
                    label="Az új jelszó megerősítése"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            bgcolor: 'rgb(70, 110, 80)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgb(60, 90, 65)',
                            },
                            '&:disabled': {
                                bgcolor: 'rgba(70, 110, 80, 0.5)',
                            },
                        }}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Mentés'}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
