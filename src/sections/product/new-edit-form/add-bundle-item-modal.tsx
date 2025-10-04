'use client';

import type { IBundleItem } from 'src/types/product';

import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
    Box,
    Stack,
    Button,
    Dialog,
    Avatar,
    TextField,
    Typography,
    DialogTitle,
    Autocomplete,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { useGetProducts } from 'src/actions/product';

import BioBadge from 'src/components/bio-badge/bio-badge';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onAdd: (item: { productId: string; qty: number; product?: any }) => void;
    existingProductIds: string[];
    editItem?: IBundleItem | null;
};

const MAX_INITIAL_OPTIONS = 10;

export function AddBundleItemModal({ open, onClose, onAdd, existingProductIds, editItem }: Props) {
    const { products } = useGetProducts();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [inputValue, setInputValue] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            qty: 1,
        },
    });

    // Update form and selected product when editItem or modal open state changes
    useEffect(() => {
        if (open) {
            if (editItem) {
                setSelectedProduct(editItem.product || null);
                setInputValue(editItem.product?.name || '');
                reset({ qty: editItem.qty });
            } else {
                setSelectedProduct(null);
                setInputValue('');
                reset({ qty: 1 });
            }
        }
    }, [open, editItem, reset]);

    // Memoize available products for better performance
    const availableProducts = useMemo(
        () => products.filter(
            (p) => !existingProductIds.includes(p.id) || p.id === editItem?.productId
        ),
        [products, existingProductIds, editItem]
    );

    // Filter and limit options based on input
    const filteredOptions = useMemo(() => {
        if (!inputValue.trim()) {
            // Show only first 10 products when no search input
            return availableProducts.slice(0, MAX_INITIAL_OPTIONS);
        }

        // Normalize search input for case-insensitive search
        const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
        
        // Fast filtering with early exit
        const filtered = availableProducts.filter((product) => {
            const name = product.name?.toLowerCase() || '';
            const sku = product.sku?.toLowerCase() || '';
            
            // Check if all search terms match either name or SKU
            return searchTerms.every(term => 
                name.includes(term) || sku.includes(term)
            );
        });

        // Limit results to 50 for performance
        return filtered.slice(0, 50);
    }, [availableProducts, inputValue]);

    const onSubmit = handleSubmit((data) => {
        if (!selectedProduct) return;

        onAdd({
            productId: selectedProduct.id,
            qty: Number(data.qty),
            product: selectedProduct, // Pass the full product object
        });

        // Reset the form state after submission
        reset();
        setSelectedProduct(null);
        setInputValue('');
    });

    const handleClose = () => {
        reset();
        setSelectedProduct(null);
        setInputValue('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editItem ? 'Csomag elem szerkesztése' : 'Csomag elem hozzáadása'}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <Autocomplete
                        value={selectedProduct}
                        inputValue={inputValue}
                        onInputChange={(event, newInputValue, reason) => {
                            // Only update input if user is typing (not selecting)
                            if (reason === 'input') {
                                setInputValue(newInputValue);
                            }
                        }}
                        onChange={(event, newValue) => setSelectedProduct(newValue)}
                        options={filteredOptions}
                        getOptionLabel={(option) => option.name || ''}
                        filterOptions={(x) => x} // Disable built-in filtering since we handle it
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Avatar
                                        src={option.featuredImage || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                        alt={option.name}
                                        variant="rounded"
                                        sx={{ width: 40, height: 40 }}
                                    />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography 
                                                variant="body2" 
                                                noWrap
                                                sx={{ flex: 1, minWidth: 0 }}
                                            >
                                                {option.name}
                                            </Typography>
                                            {option.bio && (
                                                <BioBadge width={24} height={16} />
                                            )}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {option.unit} • {option.grossPrice} Ft
                                        </Typography>
                                    </Box>
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Termék keresése"
                                placeholder={inputValue ? '' : 'Kezdj el gépelni a kereséshez...'}
                                error={!selectedProduct}
                                helperText={
                                    !selectedProduct 
                                        ? 'Termék választása kötelező' 
                                        : !inputValue 
                                        ? `Első ${Math.min(MAX_INITIAL_OPTIONS, availableProducts.length)} termék megjelenítve`
                                        : `${filteredOptions.length} találat`
                                }
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                        disabled={!!editItem}
                        loading={false}
                        noOptionsText={inputValue ? 'Nincs találat' : 'Kezdj el gépelni...'}
                    />

                    <TextField
                        {...register('qty', {
                            required: 'Mennyiség megadása kötelező',
                            min: { value: 0.1, message: 'Minimum 0.1 lehet' },
                        })}
                        label="Mennyiség"
                        type="number"
                        inputProps={{ step: 0.1, min: 0.1 }}
                        error={!!errors.qty}
                        helperText={errors.qty?.message}
                        fullWidth
                    />

                    {selectedProduct && (
                        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <Stack spacing={0.5}>
                                <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                                    Mértékegység: <strong>{selectedProduct.unit}</strong>
                                </Box>
                                <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                                    Bruttó ár: <strong>{selectedProduct.grossPrice} Ft</strong>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="outlined" color="inherit">
                    Mégse
                </Button>
                <Button onClick={onSubmit} variant="contained" disabled={!selectedProduct}>
                    {editItem ? 'Mentés' : 'Hozzáadás'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
