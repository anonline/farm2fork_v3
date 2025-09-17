import type { IAddressItem } from 'src/types/common';
import type { IBillingAddress } from 'src/types/customer';

import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useGetCustomerData } from 'src/actions/customer';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AddressFormData = {
    name: string;
    company?: string;
    taxNumber?: string;
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
    floor?: string;
    doorbell?: string;
    phoneNumber: string;
    note?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    currentAddress?: IAddressItem | null;
    customerId?: string;
    onSave: (address: IAddressItem) => Promise<void>;
};

export function OrderBillingAddressModal({ 
    open, 
    onClose, 
    currentAddress, 
    customerId,
    onSave 
}: Readonly<Props>) {
    const { customerData, customerDataLoading } = useGetCustomerData(customerId);
    
    const [selectedAddressType, setSelectedAddressType] = useState<'existing' | 'custom'>('existing');
    const [selectedExistingIndex, setSelectedExistingIndex] = useState<number>(-1);
    const [isSaving, setIsSaving] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressFormData>({
        defaultValues: {
            name: '',
            company: '',
            taxNumber: '',
            postcode: '',
            city: '',
            street: '',
            houseNumber: '',
            floor: '',
            doorbell: '',
            phoneNumber: '',
            note: '',
        }
    });

    // Get customer's billing addresses
    const billingAddresses = useMemo(() => customerData?.billingAddress || [], [customerData]);

    // Initialize form with current address data when modal opens
    useEffect(() => {
        if (open && currentAddress) {
            reset({
                name: currentAddress.name || '',
                company: currentAddress.company || '',
                taxNumber: currentAddress.taxNumber || '',
                postcode: currentAddress.postcode || '',
                city: currentAddress.city || '',
                street: currentAddress.street || '',
                houseNumber: currentAddress.houseNumber || '',
                floor: currentAddress.floor || '',
                doorbell: currentAddress.doorbell || '',
                phoneNumber: currentAddress.phoneNumber || '',
                note: currentAddress.note || '',
            });
        }
    }, [open, currentAddress, reset]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setSelectedAddressType(billingAddresses.length > 0 ? 'existing' : 'custom');
            setSelectedExistingIndex(-1);
        }
    }, [open, billingAddresses.length]);

    const handleAddressTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddressType(event.target.value as 'existing' | 'custom');
        setSelectedExistingIndex(-1);
    };

    const handleExistingAddressSelect = (index: number) => {
        setSelectedExistingIndex(index);
        const selectedAddress = billingAddresses[index];
        
        // Fill form with selected address data
        reset({
            name: selectedAddress.fullName || '',
            company: selectedAddress.companyName || '',
            taxNumber: selectedAddress.taxNumber || '',
            postcode: selectedAddress.postcode || selectedAddress.zipCode || '',
            city: selectedAddress.city || '',
            street: selectedAddress.street || '',
            houseNumber: selectedAddress.houseNumber || '',
            floor: selectedAddress.floor || '',
            doorbell: selectedAddress.doorbell || '',
            phoneNumber: selectedAddress.phone || '',
            note: selectedAddress.comment || '',
        });
    };

    const onSubmit = async (data: AddressFormData) => {
        setIsSaving(true);
        try {
            // Convert form data to IAddressItem format
            const updatedAddress: IAddressItem = {
                id: currentAddress?.id,
                name: data.name,
                company: data.company,
                taxNumber: data.taxNumber,
                fullAddress: `${data.postcode} ${data.city}, ${data.street} ${data.houseNumber}${data.floor ? `, ${data.floor}` : ''}${data.doorbell ? `, ${data.doorbell}` : ''}`,
                postcode: data.postcode,
                city: data.city,
                street: data.street,
                houseNumber: data.houseNumber,
                floor: data.floor,
                doorbell: data.doorbell,
                phoneNumber: data.phoneNumber,
                note: data.note,
            };

            await onSave(updatedAddress);
            onClose();
            toast.success('Számlázási cím sikeresen frissítve!');
        } catch (error) {
            console.error('Error saving billing address:', error);
            toast.error('Hiba történt a számlázási cím mentése során');
        } finally {
            setIsSaving(false);
        }
    };

    const formatAddressDisplay = (address: IBillingAddress): string => 
        `${address.postcode || address.zipCode} ${address.city}, ${address.street} ${address.houseNumber}${address.floor ? `, ${address.floor}` : ''}${address.doorbell ? `, ${address.doorbell}` : ''}`;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Számlázási cím szerkesztése</Typography>
                    <IconButton onClick={onClose}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {/* Address Type Selection */}
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selectedAddressType}
                            onChange={handleAddressTypeChange}
                        >
                            <FormControlLabel
                                value="existing"
                                control={<Radio />}
                                label="Válasszon a mentett címek közül"
                                disabled={billingAddresses.length === 0}
                            />
                            <FormControlLabel
                                value="custom"
                                control={<Radio />}
                                label="Egyedi cím megadása"
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Existing Addresses Section */}
                    {selectedAddressType === 'existing' && (
                        <Box>
                            {customerDataLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={24} />
                                    <Typography sx={{ ml: 2 }}>
                                        Címek betöltése...
                                    </Typography>
                                </Box>
                            ) : billingAddresses.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    Nincsenek mentett számlázási címek
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Mentett címek ({billingAddresses.length})
                                    </Typography>
                                    {billingAddresses.map((address, index) => (
                                        <Card 
                                            key={address.id || index}
                                            variant="outlined"
                                            sx={{ 
                                                cursor: 'pointer',
                                                border: selectedExistingIndex === index ? 2 : 1,
                                                borderColor: selectedExistingIndex === index 
                                                    ? 'primary.main' 
                                                    : 'divider',
                                                backgroundColor: selectedExistingIndex === index 
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.04)
                                                    : 'transparent',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                                }
                                            }}
                                            onClick={() => handleExistingAddressSelect(index)}
                                        >
                                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {address.fullName}
                                                        </Typography>
                                                        {address.companyName && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {address.companyName}
                                                            </Typography>
                                                        )}
                                                        {address.taxNumber && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Adószám: {address.taxNumber}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatAddressDisplay(address)}
                                                        </Typography>
                                                        {address.phone && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                Tel: {address.phone}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}

                    <Divider />

                    {/* Custom Address Form */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            {selectedAddressType === 'custom' ? 'Egyedi cím adatai' : 'Cím részletei'}
                        </Typography>
                        
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={2.5}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{ required: 'Név megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Teljes név *"
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                                fullWidth
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="company"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Cég neve"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Stack>

                                <Controller
                                    name="taxNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Adószám"
                                            placeholder="pl. 12345678-1-23"
                                            sx={{ maxWidth: { xs: '100%', sm: 300 } }}
                                        />
                                    )}
                                />

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Controller
                                        name="postcode"
                                        control={control}
                                        rules={{ required: 'Irányítószám megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Irányítószám *"
                                                error={!!errors.postcode}
                                                helperText={errors.postcode?.message}
                                                sx={{ maxWidth: { xs: '100%', sm: 200 } }}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="city"
                                        control={control}
                                        rules={{ required: 'Város megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Város *"
                                                error={!!errors.city}
                                                helperText={errors.city?.message}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Controller
                                        name="street"
                                        control={control}
                                        rules={{ required: 'Utca megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Utca *"
                                                error={!!errors.street}
                                                helperText={errors.street?.message}
                                                fullWidth
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="houseNumber"
                                        control={control}
                                        rules={{ required: 'Házszám megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Házszám *"
                                                error={!!errors.houseNumber}
                                                helperText={errors.houseNumber?.message}
                                                sx={{ maxWidth: { xs: '100%', sm: 150 } }}
                                            />
                                        )}
                                    />
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Controller
                                        name="floor"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Emelet/ajtó"
                                                fullWidth
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="doorbell"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Csengő"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Stack>

                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{ required: 'Telefonszám megadása kötelező' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Telefonszám *"
                                            error={!!errors.phoneNumber}
                                            helperText={errors.phoneNumber?.message}
                                            sx={{ maxWidth: { xs: '100%', sm: 300 } }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="note"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Megjegyzés"
                                            multiline
                                            rows={3}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Stack>
                        </form>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} color="inherit">
                    Mégse
                </Button>
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    variant="contained" 
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
                >
                    {isSaving ? 'Mentés...' : 'Mentés'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}