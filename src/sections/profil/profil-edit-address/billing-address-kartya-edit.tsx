import { Stack, Typography, FormControlLabel, Checkbox, TextField, Grid, Button } from "@mui/material";
import { useState } from "react";

interface IAddress {
    id: number;
    type: 'shipping' | 'billing';
    name: string; 
    address: string;
    phone: string; 
    email?: string;
    taxNumber?: string;
    isDefault: boolean;
    companyName?: string;
    postcode?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    floor?: string;
    doorbell?: string;
    comment?: string;
}

interface AddressFormProps {
    address: IAddress;
    onSave: (updatedAddress: IAddress) => void;
    onCancel: () => void;
    onDelete: () => void;
}

export default function BillingAddressEditForm({ address, onSave, onCancel, onDelete }: Readonly<AddressFormProps>) {
    const [formData, setFormData] = useState(address);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const requiredFieldSx = {
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
        },
        '& .MuiInputLabel-root.Mui-error': {
            color: 'red',
        }
    };

    return (
        <Stack spacing={3} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography variant="h6" fontWeight={600}>{address.name}</Typography>
            <Typography variant="body2" color="text.secondary">
                Jelenleg csak bizonyos kerületekbe szállítunk. Az irányítószám megadásával ellenőrizheted, hogy szállítunk-e hozzád.
            </Typography>
            <FormControlLabel control={<Checkbox checked={formData.isDefault} onChange={handleChange} name="isDefault" />} label="Alapértelmezett cím" />
            
            <TextField label="Cégnév" name="companyName" value={formData.companyName ?? ''} onChange={handleChange} fullWidth />
            
            <TextField 
                label="Teljes név" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                fullWidth 
                required 
                error={!formData.name}
                sx={requiredFieldSx}
            />
            
            <Grid container spacing={2}>
                 <Grid size={{xs:12, sm:6}}><TextField label="Irányítószám" name="postcode" value={formData.postcode ?? ''} onChange={handleChange} fullWidth required error={!formData.postcode} sx={requiredFieldSx} /></Grid>
                 <Grid size={{xs:12, sm:6}}><TextField label="Város, település" name="city" value={formData.city ?? ''} onChange={handleChange} fullWidth required error={!formData.city} sx={requiredFieldSx} /></Grid>
                 <Grid size={{xs:12, sm:6}}><TextField label="Közterület neve" placeholder="Utca, út, tér" name="street" value={formData.street ?? ''} onChange={handleChange} fullWidth required error={!formData.street} sx={requiredFieldSx} /></Grid>
                 <Grid size={{xs:12, sm:6}}><TextField label="Házszám" placeholder="Házszám és kiegészítő" name="houseNumber" value={formData.houseNumber ?? ''} onChange={handleChange} fullWidth required error={!formData.houseNumber} sx={requiredFieldSx} /></Grid>
                 <Grid size={{xs:12, sm:6}}><TextField label="Emelet, ajtó" name="floor" value={formData.floor ?? ''} onChange={handleChange} fullWidth /></Grid>
                 <Grid size={{xs:12, sm:6}}><TextField label="Kapucsengő" name="doorbell" value={formData.doorbell ?? ''} onChange={handleChange} fullWidth /></Grid>
            </Grid>

            <TextField label="Telefonszám" placeholder="+36" name="phone" value={formData.phone} onChange={handleChange} fullWidth />
            <TextField label="Adószám" name="taxNumber" value={formData.taxNumber ?? ''} onChange={handleChange} fullWidth />
            <TextField type="email" label="E-mail" name="email" value={formData.email ?? ''} onChange={handleChange} fullWidth />
            <TextField label="Megjegyzés" placeholder="TSZ mögött" name="comment" value={formData.comment ?? ''} onChange={handleChange} fullWidth multiline rows={3} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button color="error" onClick={onDelete}>Törlés</Button>
                <Stack direction="row" spacing={1}>
                    <Button variant="text" onClick={onCancel}>Mégse</Button>
                    <Button variant="contained" onClick={() => onSave(formData)} sx={{ bgcolor: 'rgb(70, 110, 80)', '&:hover': { bgcolor: 'rgb(60, 90, 65)' } }}>Mentés</Button>
                </Stack>
            </Stack>
        </Stack>
    );
}