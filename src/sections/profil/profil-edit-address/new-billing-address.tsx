import { useState, useEffect } from 'react';

import {
    Grid,
    Stack,
    Alert,
    Button,
    Checkbox,
    TextField,
    Typography,
    FormControlLabel,
} from '@mui/material';

export default function NewBillingAddressForm({
    onSave,
    onCancel,
    initialData,
    hideDeleteButton = false,
    hideDefaultCheckbox = false,
    onChange,
    errors = [],
}: Readonly<{ 
    onSave: (data: any) => void; 
    onCancel: () => void;
    initialData?: any;
    hideDeleteButton?: boolean;
    hideDefaultCheckbox?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors?: string[];
}>) {
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '',
        companyName: initialData?.companyName || '',
        postcode: initialData?.postcode || '',
        city: initialData?.city || '',
        street: initialData?.street || '',
        houseNumber: initialData?.houseNumber || '',
        phone: initialData?.phone || '',
        taxNumber: initialData?.taxNumber || '',
        email: initialData?.email || '',
        comment: initialData?.comment || '',
        isDefault: initialData?.isDefault || false,
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.fullName || '',
                companyName: initialData.companyName || '',
                postcode: initialData.postcode || '',
                city: initialData.city || '',
                street: initialData.street || '',
                houseNumber: initialData.houseNumber || '',
                phone: initialData.phone || '',
                taxNumber: initialData.taxNumber || '',
                email: initialData.email || '',
                comment: initialData.comment || '',
                isDefault: initialData.isDefault || false,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        
        // Call external onChange if provided (for error clearing)
        if (onChange) {
            onChange(e);
        }
    };

    const handleSave = () => {
        if (
            formData.fullName &&
            formData.postcode &&
            formData.city &&
            formData.street &&
            formData.houseNumber
        ) {
            onSave(formData);
        } else {
            console.log('Hiányzó kötelező mezők!');
        }
    };

    const requiredFieldSx = {
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
        },
        '& .MuiInputLabel-root.Mui-error': { color: 'red' },
    };

    return (
        <Stack spacing={3} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography variant="h6" fontWeight={600}>
                {initialData ? 'Számlázási cím szerkesztése' : 'Új számlázási cím hozzáadása'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                A számlázási cím adatai fognak megjelenni a számlán. Ezek az adatok a fizetés feldolgozásához szükségesek.
            </Typography>
            
            {/* Error messages */}
            {errors.length > 0 && (
                <Alert severity="error">
                    <Typography variant="body2" component="div">
                        Hiányzó kötelező mezők:
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Typography>
                </Alert>
            )}

            {!hideDefaultCheckbox && (
                <FormControlLabel
                    control={
                        <Checkbox
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                        />
                    }
                    label="Alapértelmezett cím"
                />
            )}
            <TextField
                name="companyName"
                label="Cégnév"
                value={formData.companyName}
                onChange={handleChange}
                fullWidth
            />
            <TextField
                name="fullName"
                label="Teljes név"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!formData.fullName}
                sx={requiredFieldSx}
            />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="postcode"
                        label="Irányítószám"
                        value={formData.postcode}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.postcode}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="city"
                        label="Város, település"
                        value={formData.city}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.city}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="street"
                        label="Közterület neve"
                        placeholder="Utca, út, tér"
                        value={formData.street}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.street}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="houseNumber"
                        label="Házszám"
                        placeholder="Házszám és kiegészítő"
                        value={formData.houseNumber}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.houseNumber}
                        sx={requiredFieldSx}
                    />
                </Grid>
            </Grid>
            <TextField
                name="phone"
                label="Telefonszám"
                placeholder="+36"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
            />
            <TextField
                name="taxNumber"
                label="Adószám"
                value={formData.taxNumber}
                onChange={handleChange}
                fullWidth
            />
            <TextField
                name="email"
                type="email"
                label="E-mail"
                value={formData.email}
                onChange={handleChange}
                fullWidth
            />
            <TextField
                name="comment"
                label="Megjegyzés"
                placeholder="pl.: Hol hagyjuk a szállítmányt?"
                value={formData.comment}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                {!hideDeleteButton && <Button color="error">Törlés</Button>}
                <Stack direction="row" spacing={1} sx={{ marginLeft: hideDeleteButton ? 'auto' : 0 }}>
                    <Button variant="text" onClick={onCancel}>
                        Mégse
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            bgcolor: 'rgb(70, 110, 80)',
                            '&:hover': { bgcolor: 'rgb(60, 90, 65)' },
                        }}
                    >
                        Mentés
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
