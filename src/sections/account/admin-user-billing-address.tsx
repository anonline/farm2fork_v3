'use client';

import type { IBillingAddress } from 'src/types/customer';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRef, useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { addUserBillingAddress, editUserBillingAddress, deleteUserBillingAddress } from 'src/actions/user-billing';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const BillingAddressSchema = zod.object({
    fullName: zod.string().min(1, { message: 'Név megadása kötelező!' }),
    companyName: zod.string().optional(),
    city: zod.string().min(1, { message: 'Város megadása kötelező!' }),
    street: zod.string().min(1, { message: 'Utca megadása kötelező!' }),
    houseNumber: zod.string().min(1, { message: 'Házszám megadása kötelező!' }),
    floor: zod.string().optional(),
    doorbell: zod.string().optional(),
    phone: zod.string().optional(),
    taxNumber: zod.string().optional(),
    email: zod.string().email({ message: 'Érvénytelen email cím!' }).optional().or(zod.literal('')),
    comment: zod.string().optional(),
    postcode: zod.string().min(4, { message: 'Irányítószám megadása kötelező!' }),
    isDefault: zod.boolean(),
});

type BillingAddressFormData = zod.infer<typeof BillingAddressSchema>;

// ----------------------------------------------------------------------

type Props = {
    userId: string;
    addressBook: IBillingAddress[];
    onUpdate: () => void;
};

export function AdminUserBillingAddress({ userId, addressBook, onUpdate }: Props) {
    const menuActions = usePopover();
    const addressForm = useBoolean();
    const confirmDelete = useBoolean();
    const [selectedAddress, setSelectedAddress] = useState<IBillingAddress | null>(null);
    const addressToDeleteRef = useRef<IBillingAddress | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues: BillingAddressFormData = {
        fullName: '',
        companyName: '',
        city: '',
        street: '',
        houseNumber: '',
        floor: '',
        doorbell: '',
        phone: '',
        taxNumber: '',
        email: '',
        comment: '',
        postcode: '',
        isDefault: false,
    };

    const methods = useForm<BillingAddressFormData>({
        resolver: zodResolver(BillingAddressSchema),
        defaultValues,
    });

    const { handleSubmit, reset } = methods;

    const handleOpenForm = useCallback((address?: IBillingAddress) => {
        if (address) {
            setSelectedAddress(address);
            reset({
                fullName: address.fullName || '',
                companyName: address.companyName || '',
                city: address.city || '',
                street: address.street || '',
                houseNumber: address.houseNumber || '',
                floor: address.floor || '',
                doorbell: address.doorbell || '',
                phone: address.phone || '',
                taxNumber: address.taxNumber || '',
                email: address.email || '',
                comment: address.comment || '',
                postcode: address.postcode || '',
                isDefault: address.isDefault || false,
            });
        } else {
            setSelectedAddress(null);
            reset(defaultValues);
        }
        addressForm.onTrue();
    }, [addressForm, reset, defaultValues]);

    const handleCloseForm = useCallback(() => {
        addressForm.onFalse();
        setSelectedAddress(null);
        reset(defaultValues);
    }, [addressForm, reset, defaultValues]);

    const handleSelectedId = useCallback(
        (event: React.MouseEvent<HTMLElement>, address: IBillingAddress) => {
            menuActions.onOpen(event);
            setSelectedAddress(address);
        },
        [menuActions]
    );

    const handleClose = useCallback(() => {
        menuActions.onClose();
    }, [menuActions]);

    const handleOpenDeleteDialog = useCallback(() => {
        addressToDeleteRef.current = selectedAddress;
        console.log('Opening delete dialog for address:', selectedAddress);
        menuActions.onClose();
        confirmDelete.onTrue();
    }, [menuActions, confirmDelete, selectedAddress]);

    const handleConfirmDelete = useCallback(async () => {
        const addressToDelete = addressToDeleteRef.current;
        
        console.log('handleConfirmDelete called, addressToDelete:', addressToDelete);
        
        if (!addressToDelete || !addressToDelete.id || addressToDelete.id.trim() === '') {
            console.error('No address selected for deletion or address has no valid ID', addressToDelete);
            toast.error('Ez a cím érvénytelen azonosítóval rendelkezik. Kérjük, törölje az összes címet és hozza létre újra.');
            return;
        }

        console.log('Deleting address:', addressToDelete.id, 'for user:', userId);

        try {
            const { success, error } = await deleteUserBillingAddress(userId, addressToDelete.id);
            
            console.log('Delete result:', { success, error });
            
            if (success) {
                toast.success('Számlázási cím sikeresen törölve!');
                onUpdate();
            } else {
                console.error('Delete failed:', error);
                toast.error(error || 'Hiba történt a cím törlése során.');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Hiba történt a cím törlése során.');
        } finally {
            confirmDelete.onFalse();
            addressToDeleteRef.current = null;
            setSelectedAddress(null);
        }
    }, [userId, onUpdate, confirmDelete]);

    const handleSetDefault = useCallback(async () => {
        if (!selectedAddress?.id) return;

        try {
            const { success, error } = await editUserBillingAddress(
                userId,
                selectedAddress.id,
                { isDefault: true }
            );
            
            if (success) {
                toast.success('Alapértelmezett cím beállítva!');
                onUpdate();
            } else {
                toast.error(error || 'Hiba történt.');
            }
        } catch (error) {
            console.error('Error setting default:', error);
            toast.error('Hiba történt.');
        } finally {
            menuActions.onClose();
            setSelectedAddress(null);
        }
    }, [selectedAddress, userId, onUpdate, menuActions]);

    const onSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);
        try {
            const addressData: IBillingAddress = {
                ...data,
                type: 'billing' as const,
                id: selectedAddress?.id,
            };

            let result;
            if (selectedAddress?.id) {
                // Edit existing address
                result = await editUserBillingAddress(userId, selectedAddress.id, addressData);
            } else {
                // Add new address
                result = await addUserBillingAddress(userId, addressData);
            }

            if (result.success) {
                toast.success(
                    selectedAddress ? 'Cím sikeresen módosítva!' : 'Cím sikeresen hozzáadva!'
                );
                handleCloseForm();
                onUpdate();
            } else {
                toast.error(result.error || 'Hiba történt.');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Hiba történt a mentés során.');
        } finally {
            setIsSubmitting(false);
        }
    });

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={handleClose}
        >
            <MenuList>
                <MenuItem onClick={handleSetDefault}>
                    <Iconify icon="eva:star-fill" />
                    Alapértelmezettként beállít
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        handleClose();
                        handleOpenForm(selectedAddress || undefined);
                    }}
                >
                    <Iconify icon="solar:pen-bold" />
                    Szerkesztés
                </MenuItem>

                <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Törlés
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    const renderAddressForm = () => (
        <Dialog fullWidth maxWidth="sm" open={addressForm.value} onClose={handleCloseForm}>
            <Form methods={methods} onSubmit={onSubmit}>
                <DialogTitle>
                    {selectedAddress ? 'Számlázási cím szerkesztése' : 'Új számlázási cím'}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                rowGap: 2,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <Field.Text name="fullName" label="Teljes név" required />
                            <Field.Text name="companyName" label="Cégnév" />
                        </Box>

                        <Box
                            sx={{
                                rowGap: 2,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <Field.Text name="postcode" label="Irányítószám" required />
                            <Field.Text name="city" label="Város" required />
                        </Box>

                        <Box
                            sx={{
                                rowGap: 2,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: '2fr 1fr', sm: '2fr 1fr' },
                            }}
                        >
                            <Field.Text name="street" label="Utca" required />
                            <Field.Text name="houseNumber" label="Házszám" required />
                        </Box>

                        <Box
                            sx={{
                                rowGap: 2,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <Field.Text name="floor" label="Emelet" />
                            <Field.Text name="doorbell" label="Ajtó" />
                        </Box>

                        <Box
                            sx={{
                                rowGap: 2,
                                columnGap: 2,
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                            }}
                        >
                            <Field.Text name="phone" label="Telefonszám" />
                            <Field.Text name="email" label="Email" type="email" />
                        </Box>

                        <Field.Text name="taxNumber" label="Adószám" />

                        <Field.Text name="comment" label="Megjegyzés" multiline rows={3} />

                        <Field.Checkbox name="isDefault" label="Alapértelmezett címként használom" />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button color="inherit" variant="outlined" onClick={handleCloseForm}>
                        Mégse
                    </Button>

                    <Button type="submit" variant="contained" loading={isSubmitting}>
                        {selectedAddress ? 'Módosítás' : 'Hozzáadás'}
                    </Button>
                </DialogActions>
            </Form>
        </Dialog>
    );

    return (
        <>
            <Card>
                <CardHeader
                    title="Számlázási címek"
                    action={
                        <Button
                            size="small"
                            color="primary"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => handleOpenForm()}
                        >
                            Új cím
                        </Button>
                    }
                />

                <Stack spacing={2} sx={{ p: 3 }}>
                    {addressBook.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                            Nincsenek számlázási címek
                        </Typography>
                    ) : (
                        addressBook.map((address) => (
                            <Box
                                key={address.id}
                                sx={{
                                    p: 2,
                                    gap: 1.5,
                                    display: 'flex',
                                    borderRadius: 1,
                                    position: 'relative',
                                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    bgcolor: address.isDefault ? 'action.selected' : 'transparent',
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle2" noWrap>
                                            {address.fullName}
                                        </Typography>
                                        {address.isDefault && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: 0.5,
                                                    typography: 'caption',
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                }}
                                            >
                                                Alapértelmezett
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {address.companyName && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            {address.companyName}
                                        </Typography>
                                    )}
                                    
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {address.postcode} {address.city}, {address.street} {address.houseNumber}
                                        {address.floor && `, ${address.floor}. em.`}
                                        {address.doorbell && ` ${address.doorbell}.`}
                                    </Typography>
                                    
                                    {address.taxNumber && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                            Adószám: {address.taxNumber}
                                        </Typography>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                                        {address.phone && (
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                Tel: {address.phone}
                                            </Typography>
                                        )}
                                        {address.email && (
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                Email: {address.email}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <IconButton
                                    onClick={(event) => handleSelectedId(event, address)}
                                    sx={{
                                        position: { xs: 'absolute', sm: 'relative' },
                                        top: { xs: 8, sm: 'auto' },
                                        right: { xs: 8, sm: 'auto' },
                                    }}
                                >
                                    <Iconify icon="eva:more-vertical-fill" />
                                </IconButton>
                            </Box>
                        ))
                    )}
                </Stack>
            </Card>

            {renderMenuActions()}
            {renderAddressForm()}

            <ConfirmDialog
                open={confirmDelete.value}
                onClose={() => {
                    confirmDelete.onFalse();
                    addressToDeleteRef.current = null;
                }}
                title="Számlázási cím törlése"
                content={
                    <>
                        Biztosan törölni szeretnéd ezt a számlázási címet?
                        {addressToDeleteRef.current && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                                <Typography variant="subtitle2">{addressToDeleteRef.current.fullName}</Typography>
                                {addressToDeleteRef.current.companyName && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {addressToDeleteRef.current.companyName}
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    {addressToDeleteRef.current.postcode} {addressToDeleteRef.current.city}, {addressToDeleteRef.current.street} {addressToDeleteRef.current.houseNumber}
                                </Typography>
                            </Box>
                        )}
                    </>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                    >
                        Törlés
                    </Button>
                }
            />
        </>
    );
}
