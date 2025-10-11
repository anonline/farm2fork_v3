import type { IBillingAddress } from 'src/types/customer';

import { useState } from 'react';

import {
    Box,
    Card,
    Chip,
    Radio,
    Button,
    Typography,
    IconButton,
    CardActionArea,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import NewBillingAddressForm from 'src/sections/profil/profil-edit-address/new-billing-address';

// ----------------------------------------------------------------------

// Local form component that supports initial data for editing
function EditableBillingAddressForm({
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
        postcode: initialData?.postcode || initialData?.zipCode || '',
        city: initialData?.city || '',
        street: initialData?.street || '',
        houseNumber: initialData?.houseNumber || '',
        phone: initialData?.phone || '',
        taxNumber: initialData?.taxNumber || '',
        email: initialData?.email || '',
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
        if (!!formData.companyName.trim() && !formData.taxNumber.trim()) newErrors.push('Cégnév megadása esetén az adószám is kötelező');
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

    return (
        <NewBillingAddressForm
            onSave={handleSave}
            onCancel={onCancel}
            initialData={formData}
            hideDeleteButton={hideDeleteButton}
            hideDefaultCheckbox={hideDefaultCheckbox}
            onChange={handleChange}
            errors={errors}
        />
    );
}

// ----------------------------------------------------------------------

type BillingAddressSelectorProps = {
    billingAddresses: IBillingAddress[];
    selectedAddressIndex: number | null;
    onAddressChange: (index: number) => void;
    onEditAddress?: (index: number) => void;
    onAddNewAddress?: (address: IBillingAddress) => void;
    onSaveEditedAddress?: (index: number, address: IBillingAddress) => void;
    hideDefaultChip?: boolean; // Controls whether to hide the default chip in address display
};

export function BillingAddressSelector({
    billingAddresses,
    selectedAddressIndex,
    onAddressChange,
    onEditAddress,
    onAddNewAddress,
    onSaveEditedAddress,
    hideDefaultChip = false,
}: BillingAddressSelectorProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Helper function to convert IBillingAddress to form data
    const addressToFormData = (address: IBillingAddress) => ({
        fullName: address.fullName || '',
        companyName: address.companyName || '',
        postcode: address.postcode || '',
        city: address.city || '',
        street: address.street || '',
        houseNumber: address.houseNumber || '',
        phone: address.phone || '',
        taxNumber: address.taxNumber || '',
        email: address.email || '',
        comment: address.comment || '',
        isDefault: address.isDefault || false,
        type: address.type || 'billing',
    });

    // Helper function to convert form data to IBillingAddress
    const formDataToAddress = (formData: any, originalId?: string): IBillingAddress => ({
        id: originalId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fullName: formData.fullName,
        companyName: formData.companyName,
        postcode: formData.postcode,
        city: formData.city,
        street: formData.street,
        houseNumber: formData.houseNumber,
        phone: formData.phone,
        taxNumber: formData.taxNumber,
        email: formData.email,
        comment: formData.comment,
        isDefault: formData.isDefault,
        type: 'billing' // Always set to 'billing' for billing addresses
    });

    const handleAddNewAddress = (formData: any) => {
        const newAddress = formDataToAddress(formData);
        if (onAddNewAddress) {
            onAddNewAddress(newAddress);
            setShowAddForm(false);
        } else {
            console.warn('onAddNewAddress callback not provided');
        }
    };

    const handleEditAddress = (index: number) => {
        if (onEditAddress) {
            onEditAddress(index);
        }
        setEditingIndex(index);
        setShowAddForm(false);
    };

    const handleSaveEditedAddress = (formData: any) => {
        if (editingIndex !== null && onSaveEditedAddress) {
            const originalAddress = billingAddresses[editingIndex];
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

    if (!billingAddresses || billingAddresses.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!showAddForm ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Nincsenek mentett számlázási címek
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
                                Új számlázási cím hozzáadása
                            </Button>
                        )}
                    </Box>
                ) : (
                    <EditableBillingAddressForm
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
            {billingAddresses.map((address, index) => (
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

                                {address.companyName && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {address.companyName}
                                    </Typography>
                                )}

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {address.postcode} {address.city} {address.street} {address.houseNumber}
                                </Typography>

                                {address.taxNumber && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Adószám: {address.taxNumber}
                                    </Typography>
                                )}

                                {address.email && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Email: {address.email}
                                    </Typography>
                                )}

                                {address.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                        {address.phone}
                                    </Typography>
                                )}

                                {((!address.taxNumber || address.taxNumber.trim() === '') && address.companyName && address.companyName.trim() !== '') || 
                                 ((!address.companyName || address.companyName.trim() === '') && address.taxNumber && address.taxNumber.trim() !== '') ? (
                                    <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                        Hiányos céges adatokat adtál meg! Kérlek ellenőrizd.
                                    </Typography>
                                ) : null}
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
                    Új számlázási cím hozzáadása
                </Button>
            )}

            {/* Add new address form */}
            {showAddForm && (
                <EditableBillingAddressForm
                    onSave={handleAddNewAddress}
                    onCancel={handleCancelForm}
                    hideDeleteButton
                    hideDefaultCheckbox
                />
            )}

            {/* Edit address form */}
            {editingIndex !== null && (
                <EditableBillingAddressForm
                    initialData={addressToFormData(billingAddresses[editingIndex])}
                    onSave={handleSaveEditedAddress}
                    onCancel={handleCancelForm}
                    hideDeleteButton
                    hideDefaultCheckbox
                />
            )}
        </Box>
    );
}