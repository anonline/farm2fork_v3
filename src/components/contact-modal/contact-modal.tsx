'use client';

import type { ChangeEvent, FormEvent } from 'react';

import { useState } from 'react';

import {
    Dialog,
    Button,
    TextField,
    Checkbox,
    DialogTitle,
    FormControlLabel,
    DialogContent,
    DialogActions,
    CircularProgress,
    Link,
    Typography,
    Alert,
} from '@mui/material';

import { themeConfig } from 'src/theme';
import { paths } from 'src/routes/paths';

import { useCaptcha } from 'src/components/captcha';
import { verifyCaptcha } from 'src/actions/captcha';
import { sendContactFormEmail } from 'src/actions/email-ssr';

import type { ContactFormSchemaType } from './schema';
import { ContactFormSchema } from './schema';

// ----------------------------------------------------------------------

type FormErrors = {
    name?: string;
    email?: string;
    message?: string;
    acceptedPolicy?: string;
    general?: string;
};

type Props = {
    open: boolean;
    subject?: string;
    onClose: () => void;
    onSuccess?: () => void;
};

export function ContactModal({ open, onClose, onSuccess, subject }: Readonly<Props>) {
    const [formData, setFormData] = useState<ContactFormSchemaType>({
        name: '',
        email: '',
        message: '',
        acceptedPolicy: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    
    // Initialize CAPTCHA
    const { executeRecaptcha, scriptElement } = useCaptcha('contact_form');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormData((prev) => ({ ...prev, acceptedPolicy: checked }));
        if (errors.acceptedPolicy) {
            setErrors((prev) => ({ ...prev, acceptedPolicy: undefined }));
        }
    };

    const validateForm = (): boolean => {
        try {
            ContactFormSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof Error && 'errors' in error) {
                const zodErrors = (error as any).errors;
                const newErrors: FormErrors = {};
                
                for (const err of zodErrors) {
                    const field = err.path[0] as keyof FormErrors;
                    if (field) {
                        newErrors[field] = err.message;
                    }
                }
                
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors((prev) => ({ ...prev, general: undefined }));

        try {
            // Execute reCAPTCHA
            const captchaToken = await executeRecaptcha();
            if (!captchaToken) {
                setErrors((prev) => ({ 
                    ...prev, 
                    general: 'CAPTCHA ellenőrzés sikertelen. Kérjük, próbálja újra.' 
                }));
                setLoading(false);
                return;
            }

            // Verify CAPTCHA on server
            const captchaValid = await verifyCaptcha(captchaToken, "contact_form");
            
            if (!captchaValid) {
                setErrors((prev) => ({ 
                    ...prev, 
                    general: 'CAPTCHA ellenőrzés sikertelen. Kérjük, próbálja újra.' 
                }));
                setLoading(false);
                return;
            }

            // Send email
            const result = await sendContactFormEmail({
                subject: subject || 'Új kapcsolatfelvételi üzenet a weboldalról',
                name: formData.name,
                email: formData.email,
                message: formData.message,
                captchaToken,
            });

            if (!result.success) {
                setErrors((prev) => ({ 
                    ...prev, 
                    general: result.error || 'Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.' 
                }));
                setLoading(false);
                return;
            }

            // Success
            if (onSuccess) {
                onSuccess();
            }

            // Reset form
            setFormData({
                name: '',
                email: '',
                message: '',
                acceptedPolicy: false,
            });

            onClose();
        } catch (error) {
            console.error('Error sending contact form:', error);
            setErrors((prev) => ({ 
                ...prev, 
                general: 'Váratlan hiba történt. Kérjük, próbálja újra később.' 
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            // Reset form on close
            setFormData({
                name: '',
                email: '',
                message: '',
                acceptedPolicy: false,
            });
            setErrors({});
        }
    };

    return (
        <>
            {scriptElement}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '8px',
                            p: 1,
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontFamily: themeConfig.fontFamily.bricolage,
                        fontSize: '28px',
                        fontWeight: 600,
                        pb: 2,
                    }}
                >
                    Miben segíthetünk?
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt:1 }}>
                        {errors.general && (
                            <Alert severity="error" sx={{ mb: 1 }}>
                                {errors.general}
                            </Alert>
                        )}
                    <TextField
                        fullWidth
                        label="Név"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Email cím"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Üzenet"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        disabled={loading}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.acceptedPolicy}
                                onChange={handleCheckboxChange}
                                name="acceptedPolicy"
                                disabled={loading}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ color: errors.acceptedPolicy ? 'error.main' : 'text.primary' }}>
                                Elfogadom az{' '}
                                <Link
                                    href={paths.adatkezelesi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: 'primary.main' }}
                                >
                                    adatkezelési nyilatkozatot
                                </Link>
                            </Typography>
                        }
                        sx={{ alignItems: 'center' }}
                    />
                    {errors.acceptedPolicy && (
                        <Typography variant="caption" color="error" sx={{ mt: -1, ml: 4 }}>
                            {errors.acceptedPolicy}
                        </Typography>
                    )}

                    {/* CAPTCHA component will be added here */}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        Mégse
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Küldés...' : 'Elküldöm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        </>
    );
}
