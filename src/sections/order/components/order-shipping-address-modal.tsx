import type { IDeliveryAddress } from 'src/types/customer';
import type { IOrderShippingAddress } from 'src/types/order';

import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
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
import { checkShippingZoneAvailable } from 'src/actions/shipping-zone';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AddressFormData = {
    name: string;
    company?: string;
    postcode: string;
    city: string;
    street: string;
    houseNumber: string;
    floor?: string;
    doorbell?: string;
    phoneNumber: string;
    email?: string;
    note?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    currentAddress?: IOrderShippingAddress;
    customerId?: string;
    onSave: (address: IOrderShippingAddress) => Promise<void>;
};

export function OrderShippingAddressModal({ 
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
    const [addressWarnings, setAddressWarnings] = useState<Record<number, boolean>>({});
    const [checkingShippingZones, setCheckingShippingZones] = useState(false);
    const [customPostcodeWarning, setCustomPostcodeWarning] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<AddressFormData>({
        defaultValues: {
            name: '',
            company: '',
            postcode: '',
            city: '',
            street: '',
            houseNumber: '',
            floor: '',
            doorbell: '',
            phoneNumber: '',
            email: '',
            note: '',
        }
    });

    // Get customer's delivery addresses
    const deliveryAddresses = useMemo(() => customerData?.deliveryAddress || [], [customerData]);

    // Initialize form with current address data when modal opens
    useEffect(() => {
        if (open && currentAddress) {
            reset({
                name: currentAddress.name || '',
                company: currentAddress.company || '',
                postcode: currentAddress.postcode || '',
                city: currentAddress.city || '',
                street: currentAddress.street || '',
                houseNumber: currentAddress.houseNumber || '',
                floor: currentAddress.floor || '',
                doorbell: currentAddress.doorbell || '',
                phoneNumber: currentAddress.phoneNumber || '',
                email: currentAddress.email || '',
                note: currentAddress.note || '',
            });
        }
    }, [open, currentAddress, reset]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setSelectedAddressType(deliveryAddresses.length > 0 ? 'existing' : 'custom');
            setSelectedExistingIndex(-1);
            setAddressWarnings({});
        }
    }, [open, deliveryAddresses.length]);

    // Check shipping zones for existing addresses
    useEffect(() => {
        if (deliveryAddresses.length > 0 && open) {
            setCheckingShippingZones(true);
            const checkAddresses = async () => {
                const warnings: Record<number, boolean> = {};
                
                await Promise.all(
                    deliveryAddresses.map(async (address, index) => {
                        const postcode = address.postcode || address.zipCode || '';
                        if (postcode) {
                            try {
                                const isAvailable = await checkShippingZoneAvailable(postcode);
                                warnings[index] = !isAvailable;
                            } catch (error) {
                                console.error('Error checking shipping zone for address:', error);
                                warnings[index] = true; // Show warning if check fails
                            }
                        } else {
                            warnings[index] = true; // Show warning if no postcode
                        }
                    })
                );
                
                setAddressWarnings(warnings);
                setCheckingShippingZones(false);
            };
            
            checkAddresses();
        }
    }, [deliveryAddresses, open]);

    const handleAddressTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddressType(event.target.value as 'existing' | 'custom');
        setSelectedExistingIndex(-1);
        setCustomPostcodeWarning(null); // Reset custom postcode warning
    };

    const handleExistingAddressSelect = (index: number) => {
        setSelectedExistingIndex(index);
        const selectedAddress = deliveryAddresses[index];
        
        // Fill form with selected address data
        reset({
            name: selectedAddress.fullName || '',
            company: '', // Company not stored in delivery address
            postcode: selectedAddress.postcode || selectedAddress.zipCode || '',
            city: selectedAddress.city || '',
            street: selectedAddress.street || '',
            houseNumber: selectedAddress.houseNumber || '',
            floor: selectedAddress.floor || '',
            doorbell: selectedAddress.doorbell || '',
            phoneNumber: selectedAddress.phone || '',
            email: '', // Email not stored in delivery address
            note: selectedAddress.comment || '',
        });
    };

    const handlePostcodeChange = async (postcode: string) => {
        if (selectedAddressType === 'custom' && postcode.length >= 4) {
            try {
                const isAvailable = await checkShippingZoneAvailable(postcode);
                if (!isAvailable) {
                    setCustomPostcodeWarning(
                        'Sajnos erre az irányítószámra még nem elérhető a házhozszállításunk. Kérlek ellenőrizd az irányítószámot vagy válassz másik címet.'
                    );
                } else {
                    setCustomPostcodeWarning(null);
                }
            } catch (error) {
                console.error('Error checking custom postcode:', error);
                setCustomPostcodeWarning(
                    'Hiba történt az irányítószám ellenőrzése során. Kérlek próbáld újra.'
                );
            }
        } else {
            setCustomPostcodeWarning(null);
        }
    };

    const onSubmit = async (data: AddressFormData) => {
        setIsSaving(true);
        try {
            // Convert form data to IOrderShippingAddress format
            const updatedAddress: IOrderShippingAddress = {
                fullAddress: `${data.postcode} ${data.city}, ${data.street} ${data.houseNumber}${data.floor ? `, ${data.floor}` : ''}${data.doorbell ? `, ${data.doorbell}` : ''}`,
                name: data.name,
                company: data.company,
                postcode: data.postcode,
                city: data.city,
                street: data.street,
                houseNumber: data.houseNumber,
                floor: data.floor,
                doorbell: data.doorbell,
                phoneNumber: data.phoneNumber,
                email: data.email,
                note: data.note,
                taxNumber: currentAddress?.taxNumber, // Preserve existing tax number if any
            };

            await onSave(updatedAddress);
            onClose();
            toast.success('Szállítási cím sikeresen frissítve!');
        } catch (error) {
            console.error('Error saving shipping address:', error);
            toast.error('Hiba történt a szállítási cím mentése során');
        } finally {
            setIsSaving(false);
        }
    };

    const formatAddressDisplay = (address: IDeliveryAddress): string => 
        `${address.postcode || address.zipCode} ${address.city}, ${address.street} ${address.houseNumber}${address.floor ? `, ${address.floor}` : ''}${address.doorbell ? `, ${address.doorbell}` : ''}`;

    // Determine if save should be disabled
    const isSaveDisabled = isSaving || 
        //(selectedAddressType === 'existing' && selectedExistingIndex === -1) ||
        (selectedAddressType === 'existing' && selectedExistingIndex >= 0 && addressWarnings[selectedExistingIndex]) ||
        (selectedAddressType === 'custom' && !!customPostcodeWarning);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Szállítási cím szerkesztése</Typography>
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
                                disabled={deliveryAddresses.length === 0}
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
                            {customerDataLoading || checkingShippingZones ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={24} />
                                    <Typography sx={{ ml: 2 }}>
                                        {customerDataLoading ? 'Címek betöltése...' : 'Szállítási zónák ellenőrzése...'}
                                    </Typography>
                                </Box>
                            ) : deliveryAddresses.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    Nincsenek mentett szállítási címek
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Mentett címek ({deliveryAddresses.length})
                                    </Typography>
                                    {deliveryAddresses.map((address, index) => {
                                        const hasWarning = addressWarnings[index];
                                        return (
                                            <Card 
                                                key={address.id || index}
                                                variant="outlined"
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    border: selectedExistingIndex === index ? 2 : 1,
                                                    borderColor: hasWarning 
                                                        ? 'warning.main'
                                                        : selectedExistingIndex === index 
                                                            ? 'primary.main' 
                                                            : 'divider',
                                                    backgroundColor: selectedExistingIndex === index 
                                                        ? (theme) => alpha(theme.palette.primary.main, 0.04)
                                                        : hasWarning 
                                                            ? (theme) => alpha(theme.palette.warning.main, 0.04)
                                                            : 'transparent',
                                                    '&:hover': {
                                                        borderColor: hasWarning ? 'warning.main' : 'primary.main',
                                                        backgroundColor: (theme) => alpha(
                                                            hasWarning ? theme.palette.warning.main : theme.palette.primary.main, 
                                                            0.04
                                                        ),
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
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatAddressDisplay(address)}
                                                            </Typography>
                                                            {address.phone && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                    Tel: {address.phone}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        {hasWarning && (
                                                            <Chip
                                                                icon={<Iconify icon="solar:danger-triangle-bold" />}
                                                                label="Nem szállítható"
                                                                color="warning"
                                                                size="small"
                                                                sx={{ ml: 1, flexShrink: 0 }}
                                                            />
                                                        )}
                                                    </Box>
                                                    
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
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

                                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Controller
                                        name="postcode"
                                        control={control}
                                        rules={{ required: 'Irányítószám megadása kötelező' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Irányítószám *"
                                                error={!!errors.postcode || !!customPostcodeWarning}
                                                helperText={errors.postcode?.message || customPostcodeWarning}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handlePostcodeChange(e.target.value);
                                                }}
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

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Stack>

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
                    disabled={isSaveDisabled}
                    startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
                >
                    {isSaving ? 'Mentés...' : 'Mentés'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}