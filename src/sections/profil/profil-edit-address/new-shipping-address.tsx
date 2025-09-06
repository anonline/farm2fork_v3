import { useState } from 'react';

import {
    Grid,
    Stack,
    Button,
    Checkbox,
    TextField,
    Typography,
    FormControlLabel,
} from '@mui/material';

export default function NewShippingAddressForm({
    onSave,
    onCancel,
}: Readonly<{ onSave: (data: any) => void; onCancel: () => void }>) {
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        postcode: '',
        city: '',
        street: '',
        houseNumber: '',
        floor: '',
        doorbell: '',
        phone: '',
        comment: '',
        isDefault: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => {
        if (
            formData.fullName &&
            formData.postcode &&
            formData.city &&
            formData.street &&
            formData.houseNumber &&
            formData.phone
        ) {
            onSave(formData);
        } else {
            console.log('Hiányzó kötelező mezők! Kérjük, töltse ki az összes piros mezőt.');
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
                Új cím hozzáadása
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Jelenleg csak bizonyos kerületekbe szállítunk. Az irányítószám megadásával
                ellenőrizheted, hogy szállítunk-e hozzád.
            </Typography>
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
            <TextField
                name="companyName"
                label="Cég név"
                value={formData.companyName}
                onChange={handleChange}
                fullWidth
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
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="floor"
                        label="Emelet, ajtó"
                        value={formData.floor}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="doorbell"
                        label="Kapucsengő"
                        value={formData.doorbell}
                        onChange={handleChange}
                        fullWidth
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
                required
                error={!formData.phone}
                sx={requiredFieldSx}
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
                <Button color="error">Törlés</Button>
                <Stack direction="row" spacing={1}>
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
