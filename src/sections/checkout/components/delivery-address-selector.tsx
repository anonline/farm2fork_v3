import type { IDeliveryAddress } from 'src/types/customer';

import { useState, useEffect } from 'react';

import {
    Box,
    Card,
    Grid,
    Chip,
    Radio,
    Stack,
    Alert,
    Button,
    Tooltip,
    Checkbox,
    TextField,
    Typography,
    IconButton,
    CardActionArea,
    FormControlLabel,
} from '@mui/material';

import { checkShippingZoneAvailable } from 'src/actions/shipping-zone';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

// Local form component that supports initial data for editing
function EditableShippingAddressForm({
    initialData,
    onSave,
    onCancel,
    hideDeleteButton = false,
    hideDefaultCheckbox = false,
}: {
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
    hideDeleteButton?: boolean;
    hideDefaultCheckbox?: boolean;
}) {
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '',
        companyName: initialData?.companyName || '',
        postcode: initialData?.postcode || '',
        city: initialData?.city || '',
        street: initialData?.street || '',
        houseNumber: initialData?.houseNumber || '',
        floor: initialData?.floor || '',
        doorbell: initialData?.doorbell || '',
        phone: initialData?.phone || '',
        comment: initialData?.comment || '',
        isDefault: initialData?.isDefault || false,
    });

    const [errors, setErrors] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const validateForm = () => {
        const newErrors: string[] = [];
        if (!formData.fullName.trim()) newErrors.push('Teljes név kötelező');
        if (!formData.postcode.trim()) newErrors.push('Irányítószám kötelező');
        if (!formData.city.trim()) newErrors.push('Város kötelező');
        if (!formData.street.trim()) newErrors.push('Utca kötelező');
        if (!formData.houseNumber.trim()) newErrors.push('Házszám kötelező');
        if (!formData.phone.trim()) newErrors.push('Telefonszám kötelező');
        return newErrors;
    };

    const handleSave = () => {
        const validationErrors = validateForm();
        if (validationErrors.length === 0) {
            onSave(formData);
        } else {
            setErrors(validationErrors);
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
                {initialData ? 'Cím szerkesztése' : 'Új cím hozzáadása'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Jelenleg csak bizonyos kerületekbe szállítunk. Az irányítószám megadásával
                ellenőrizheted, hogy szállítunk-e hozzád.
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
                name="fullName"
                label="Teljes név"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                error={!formData.fullName.trim()}
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
                        error={!formData.postcode.trim()}
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
                        error={!formData.city.trim()}
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
                        error={!formData.street.trim()}
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
                        error={!formData.houseNumber.trim()}
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
                error={!formData.phone.trim()}
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

// ----------------------------------------------------------------------

type DeliveryAddressSelectorProps = {
    deliveryAddresses: IDeliveryAddress[];
    selectedAddressIndex: number | null;
    onAddressChange: (index: number) => void;
    onEditAddress?: (index: number) => void;
    onAddNewAddress?: (address: IDeliveryAddress) => void;
    onSaveEditedAddress?: (index: number, address: IDeliveryAddress) => void;
    onShippingZoneError?: (hasError: boolean) => void;
    isHomeDelivery?: boolean;
    showLastOption?: boolean; // Controls whether to show the fallback "add address" option
    hideDefaultChip?: boolean; // Controls whether to hide the default chip in address display
};

export function DeliveryAddressSelector({
    deliveryAddresses,
    selectedAddressIndex,
    onAddressChange,
    onEditAddress,
    onAddNewAddress,
    onSaveEditedAddress,
    onShippingZoneError,
    isHomeDelivery = false,
    showLastOption = true,
    hideDefaultChip = false,
}: DeliveryAddressSelectorProps) {
    const [shippingZoneError, setShippingZoneError] = useState<string | null>(null);
    const [checkingZone, setCheckingZone] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Helper function to convert IDeliveryAddress to form data
    const addressToFormData = (address: IDeliveryAddress) => ({
        fullName: address.fullName || '',
        companyName: '', // Not available in IDeliveryAddress
        postcode: address.postcode || '',
        city: address.city || '',
        street: address.street || '',
        houseNumber: address.houseNumber || '',
        floor: address.floor || '',
        doorbell: address.doorbell || '',
        phone: address.phone || '',
        comment: address.comment || '',
        isDefault: address.isDefault || false,
        type: address.type || 'shipping', // Include type field
    });

    // Helper function to convert form data to IDeliveryAddress
    const formDataToAddress = (formData: any, originalId?: string): IDeliveryAddress => ({
        id: originalId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Preserve existing ID or generate new one
        fullName: formData.fullName,
        postcode: formData.postcode,
        city: formData.city,
        street: formData.street,
        houseNumber: formData.houseNumber,
        floor: formData.floor,
        doorbell: formData.doorbell,
        phone: formData.phone,
        comment: formData.comment,
        isDefault: formData.isDefault,
        type: 'shipping' // Always set to 'shipping' for delivery addresses
    });

    const handleAddNewAddress = (formData: any) => {
        const newAddress = formDataToAddress(formData);
        if (onAddNewAddress) {
            onAddNewAddress(newAddress);
            setShowAddForm(false);
        } else {
            console.warn('onAddNewAddress callback is not provided');
        }
    };

    const handleEditAddress = (index: number) => {
        setEditingIndex(index);
        if (onEditAddress) {
            onEditAddress(index);
        }
    };

    const handleSaveEditedAddress = (formData: any) => {
        if (editingIndex !== null && onSaveEditedAddress) {
            // Get the original address to preserve its ID
            const originalAddress = deliveryAddresses[editingIndex];
            const editedAddress = formDataToAddress(formData, originalAddress?.id);
            onSaveEditedAddress(editingIndex, editedAddress);
            setEditingIndex(null);
        } else {
            console.warn('onSaveEditedAddress callback is not provided or editingIndex is null');
        }
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setEditingIndex(null);
    };

    // Check shipping zone when address is selected and it's home delivery
    useEffect(() => {
        if (
            !isHomeDelivery ||
            selectedAddressIndex === null ||
            !deliveryAddresses[selectedAddressIndex]
        ) {
            setShippingZoneError(null);
            if (onShippingZoneError) {
                onShippingZoneError(false);
            }
            return;
        }

        const checkShippingZone = async () => {
            setCheckingZone(true);
            setShippingZoneError(null);

            try {
                const selectedAddress = deliveryAddresses[selectedAddressIndex];
                const isAvailable = await checkShippingZoneAvailable(selectedAddress.postcode || '0000');

                if (!isAvailable) {
                    const errorMessage =
                        'Sajnos a kiválasztott címre még nem elérhető a házhozszállításunk. Kérlek válassz a személyes átvételi pontjaink közül. További információ a rendelés menetéről.';
                    setShippingZoneError(errorMessage);
                    if (onShippingZoneError) {
                        onShippingZoneError(true);
                    }
                } else {
                    if (onShippingZoneError) {
                        onShippingZoneError(false);
                    }
                }
            } catch (error) {
                console.error('Error checking shipping zone:', error);
                const errorMessage =
                    'Hiba történt a szállítási zóna ellenőrzése során. Kérlek próbáld újra.';
                setShippingZoneError(errorMessage);
                if (onShippingZoneError) {
                    onShippingZoneError(true);
                }
            } finally {
                setCheckingZone(false);
            }
        };

        checkShippingZone();
    }, [selectedAddressIndex, deliveryAddresses, isHomeDelivery, onShippingZoneError]);
    if (!deliveryAddresses || deliveryAddresses.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!showAddForm ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Nincsenek mentett szállítási címek
                        </Typography>
                        {onAddNewAddress && (
                            <Button
                                variant="outlined"
                                startIcon={<Iconify icon="solar:add-circle-bold" />}
                                onClick={() => setShowAddForm(true)}
                                sx={{
                                    borderColor: 'rgb(70, 110, 80)',
                                    color: 'rgb(70, 110, 80)',
                                    '&:hover': {
                                        borderColor: 'rgb(60, 90, 65)',
                                        bgcolor: 'rgba(70, 110, 80, 0.04)',
                                    },
                                }}
                            >
                                Új cím hozzáadása
                            </Button>
                        )}
                    </Box>
                ) : (
                    <EditableShippingAddressForm
                        onSave={handleAddNewAddress}
                        onCancel={handleCancelForm}
                        hideDeleteButton
                        hideDefaultCheckbox
                    />
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {deliveryAddresses.map((address, index) => (
                <Card
                    key={index}
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'background.paper',
                        },
                        ...(selectedAddressIndex === index && {
                            borderColor: 'primary.main',
                            //bgcolor: 'primary.lighter',
                        }),
                    }}
                >
                    
                    {/* Edit button positioned absolutely outside the clickable area */}
                    {onEditAddress && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(index);
                            }}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'background.paper',
                                zIndex: 1,
                                '&:hover': {
                                    //bgcolor: 'grey.100',
                                },
                            }}
                        >
                            <Iconify icon="solar:pen-bold" width={16} />
                        </IconButton>
                    )}

                    <CardActionArea onClick={() => onAddressChange(index)} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Radio
                                checked={selectedAddressIndex === index}
                                sx={{ mt: -0.5 }}
                                color="primary"
                            />

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {address.fullName} {!hideDefaultChip && address.isDefault && (
                                        <Chip
                                            label="Alapértelmezett"
                                            size="small"
                                            color="primary"
                                            sx={{ ml: 3, mb: 0.4, height: 20, fontSize: '0.75rem' }}
                                        />
                                    )}
                                    
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 0.5,
                                        flexWrap: 'wrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    {address.comment && (
                                        <Tooltip title={address.comment}>
                                            <Iconify icon="eva:info-outline" height={16} />
                                        </Tooltip>
                                    )}
                                    {address.postcode} {address.city} {address.street} {address.houseNumber}
                                    {address.floor && `, ${address.floor}`}
                                    {address.doorbell && `, csengő: ${address.doorbell}`}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {address.phone}
                                </Typography>
                            </Box>
                        </Box>
                    </CardActionArea>
                </Card>
            ))}

            {/* Add new address button when there are existing addresses */}
            {onAddNewAddress && !showAddForm && editingIndex === null && (
                <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:add-circle-bold" />}
                    onClick={() => setShowAddForm(true)}
                    sx={{
                        borderColor: 'rgb(70, 110, 80)',
                        color: 'rgb(70, 110, 80)',
                        '&:hover': {
                            borderColor: 'rgb(60, 90, 65)',
                            bgcolor: 'rgba(70, 110, 80, 0.04)',
                        },
                    }}
                >
                    Új cím hozzáadása
                </Button>
            )}

            {/* Add new address form */}
            {showAddForm && (
                <EditableShippingAddressForm
                    onSave={handleAddNewAddress}
                    onCancel={handleCancelForm}
                    hideDeleteButton
                    hideDefaultCheckbox
                />
            )}

            {/* Edit address form */}
            {editingIndex !== null && (
                <EditableShippingAddressForm
                    initialData={addressToFormData(deliveryAddresses[editingIndex])}
                    onSave={handleSaveEditedAddress}
                    onCancel={handleCancelForm}
                    hideDeleteButton
                    hideDefaultCheckbox
                />
            )}

            {/* Shipping zone error alert */}
            {shippingZoneError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        {shippingZoneError.includes('További információ') ? (
                            <>
                                Sajnos a kiválasztott címre még nem elérhető a házhozszállításunk.
                                Kérlek válassz a személyes átvételi pontjaink közül. További
                                információ a{' '}
                                <Box
                                    component="a"
                                    href="/rolunk"
                                    sx={{
                                        color: 'primary.main',
                                        textDecoration: 'underline',
                                        '&:hover': {
                                            textDecoration: 'none',
                                        },
                                    }}
                                >
                                    rendelés menetéről
                                </Box>
                                .
                            </>
                        ) : (
                            shippingZoneError
                        )}
                    </Typography>
                </Alert>
            )}

            {/* Loading state */}
            {checkingZone && selectedAddressIndex !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Szállítási zóna ellenőrzése...
                    </Typography>
                </Box>
            )}

            {/* Last option - Fallback add address button 
            {showLastOption && onAddNewAddress && !showAddForm && editingIndex === null && deliveryAddresses.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Nem találod a megfelelő címet? Vagy új címet szeretnél hozzáadni?
                    </Typography>
                    <Button
                        variant="text"
                        startIcon={<Iconify icon="solar:add-circle-bold" />}
                        onClick={() => setShowAddForm(true)}
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            '&:hover': {
                                color: 'primary.main',
                                bgcolor: 'transparent',
                            },
                        }}
                    >
                        + Új szállítási cím hozzáadása
                    </Button>
                </Box>
            )}*/}
        </Box>
    );
}
