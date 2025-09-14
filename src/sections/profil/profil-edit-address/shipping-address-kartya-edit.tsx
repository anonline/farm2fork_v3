'use client';

import type { IAddress } from 'src/types/address';

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

import AddressDeleteConfirmModal from './address-delete-confirm-modal';

interface AddressFormProps {
    address: IAddress;
    onSave: (updatedAddress: IAddress) => void;
    onCancel: () => void;
    onDelete: () => void;
}

export default function ShippingAddressKartyaEdit({
    address,
    onSave,
    onCancel,
    onDelete,
}: Readonly<AddressFormProps>) {
    const [formData, setFormData] = useState({
        fullName: address.fullName || '',
        companyName: address.companyName || '',
        postcode: address.postcode || '',
        city: address.city || '',
        street: address.street || '',
        houseNumber: address.houseNumber || '',
        floor: address.type === 'shipping' ? (address as any).floor || '' : '',
        doorbell: address.type === 'shipping' ? (address as any).doorbell || '' : '',
        phone: address.phone || '',
        comment: address.comment || '',
        isDefault: address.isDefault || false,
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
            const updatedAddress: IAddress = {
                id: address.id,
                type: 'shipping',
                fullName: formData.fullName,
                companyName: formData.companyName || undefined,
                postcode: formData.postcode,
                city: formData.city,
                street: formData.street,
                houseNumber: formData.houseNumber,
                phone: formData.phone,
                comment: formData.comment || undefined,
                isDefault: formData.isDefault,
                floor: formData.floor || undefined,
                doorbell: formData.doorbell || undefined,
            } as IAddress;
            onSave(updatedAddress);
        } else {
            console.error('Hiányzó kötelező mezők!');
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        onDelete();
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const requiredFieldSx = {
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: 'red',
        },
        '& .MuiInputLabel-root.Mui-error': {
            color: 'red',
        },
    };

    return (
        <Stack spacing={3} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography variant="h6" fontWeight={600}>
                {address.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Jelenleg csak bizonyos kerületekbe szállítunk. Az irányítószám megadásával
                ellenőrizheted, hogy szállítunk-e hozzád.
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.isDefault}
                        onChange={handleChange}
                        name="isDefault"
                    />
                }
                label="Alapértelmezett cím"
            />
            <TextField
                label="Teljes név"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!formData.fullName}
                sx={requiredFieldSx}
            />
            <TextField
                label="Cég név"
                name="companyName"
                value={formData.companyName ?? ''}
                onChange={handleChange}
                fullWidth
            />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Irányítószám"
                        name="postcode"
                        value={formData.postcode ?? ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.postcode}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Város"
                        name="city"
                        value={formData.city ?? ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.city}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Közterület neve"
                        name="street"
                        value={formData.street ?? ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.street}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Házszám"
                        name="houseNumber"
                        value={formData.houseNumber ?? ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!formData.houseNumber}
                        sx={requiredFieldSx}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Emelet, ajtó"
                        name="floor"
                        value={formData.floor ?? ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Kapucsengő"
                        name="doorbell"
                        value={formData.doorbell ?? ''}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <TextField
                label="Telefonszám"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                error={!formData.phone}
                sx={requiredFieldSx}
            />
            <TextField
                label="Megjegyzés"
                name="comment"
                value={formData.comment ?? ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button color="error" onClick={handleDeleteClick}>
                    Törlés
                </Button>
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

            <AddressDeleteConfirmModal
                open={showDeleteConfirm}
                address={address}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </Stack>
    );
}
