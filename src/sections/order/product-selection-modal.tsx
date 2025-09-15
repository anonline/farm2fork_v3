import type { IProductItem } from 'src/types/product';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Alert, Switch, FormControlLabel } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { useSearchProductsAdmin } from 'src/actions/product';

import { Iconify } from 'src/components/iconify';
import BioBadge from 'src/components/bio-badge/bio-badge';

// ----------------------------------------------------------------------

export type ProductForOrder = {
    id: string;
    name: string;
    sku: string;
    netPrice: number;
    vat: number;
    unit: string;
    quantity: number;
    coverUrl: string;
    bio: boolean;
    stock: number | null;
    manageStock: boolean;
    backorder?: boolean;
    isCustom?: boolean;
    uniqueKey?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onAddProducts: (products: ProductForOrder[]) => void;
};

export function ProductSelectionModal({ open, onClose, onAddProducts }: Props) {
    const [selectedProducts, setSelectedProducts] = useState<ProductForOrder[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [showCustomProduct, setShowCustomProduct] = useState(false);
    const [customProduct, setCustomProduct] = useState<Partial<ProductForOrder>>({
        name: '',
        netPrice: 0,
        vat: 27,
        unit: 'db',
        quantity: 1,
        isCustom: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Debounce search query
    const debouncedSearchValue = useMemo(() => {
        if (searchValue.length < 2) return '';
        return searchValue;
    }, [searchValue]);

    const { searchResults, searchLoading } = useSearchProductsAdmin(debouncedSearchValue);
    
    // Transform products for autocomplete
    const productOptions = searchResults.map((product: IProductItem, index) => ({
        id: product.id.toString(),
        name: product.name,
        sku: product.sku,
        netPrice: product.netPrice,
        vat: product.vat,
        unit: product.unit,
        quantity: 1,
        coverUrl: product.coverUrl || product.featuredImage || '',
        bio: product.bio,
        stock: product.stock,
        manageStock: product.stock !== null, // Stock is managed if stock field is not null
        backorder: product.backorder,
        isCustom: false,
        uniqueKey: `${product.id}-${index}`, // Add unique key for React
    }));

    const handleProductSelect = useCallback((product: ProductForOrder | null) => {
        if (!product) return;

        // Check if product already selected
        const isAlreadySelected = selectedProducts.some(p => p.id === product.id && !p.isCustom);
        if (isAlreadySelected) return;

        setSelectedProducts(prev => [...prev, { ...product }]);
        setSearchValue('');
    }, [selectedProducts]);

    const handleRemoveProduct = useCallback((index: number) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleProductChange = useCallback((index: number, field: keyof ProductForOrder, value: any) => {
        setSelectedProducts(prev => prev.map((product, i) => 
            i === index ? { ...product, [field]: value } : product
        ));

        // Clear errors when user starts fixing them
        const errorKey = `${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    }, [errors]);

    const handleAddCustomProduct = useCallback(() => {
        if (!customProduct.name || !customProduct.netPrice || customProduct.netPrice <= 0) {
            return;
        }

        const newCustomProduct: ProductForOrder = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: customProduct.name,
            sku: `CUSTOM_${Date.now()}`,
            netPrice: customProduct.netPrice,
            vat: customProduct.vat || 27,
            unit: customProduct.unit || 'db',
            quantity: customProduct.quantity || 1,
            coverUrl: '',
            bio: false,
            stock: null,
            manageStock: false,
            backorder: false,
            isCustom: true,
        };

        setSelectedProducts(prev => [...prev, newCustomProduct]);
        setCustomProduct({
            name: '',
            netPrice: 0,
            vat: 27,
            unit: 'db',
            quantity: 1,
            isCustom: true,
        });
        setShowCustomProduct(false);
    }, [customProduct]);

    const validateProducts = useCallback(() => {
        const newErrors: Record<string, string> = {};

        selectedProducts.forEach((product, index) => {
            if (product.quantity <= 0) {
                newErrors[`${index}_quantity`] = 'A mennyiség nem lehet nulla vagy negatív';
            }
            if (product.vat < 0) {
                newErrors[`${index}_vat`] = 'Az ÁFA nem lehet negatív';
            }
            if (product.netPrice <= 0) {
                newErrors[`${index}_netPrice`] = 'A nettó ár nem lehet nulla vagy negatív';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [selectedProducts]);

    const handleSubmit = useCallback(() => {
        if (!validateProducts()) return;

        onAddProducts(selectedProducts);
        setSelectedProducts([]);
        setShowCustomProduct(false);
        setCustomProduct({
            name: '',
            netPrice: 0,
            vat: 27,
            unit: 'db',
            quantity: 1,
            isCustom: true,
        });
        onClose();
    }, [selectedProducts, validateProducts, onAddProducts, onClose]);

    const handleClose = useCallback(() => {
        setSelectedProducts([]);
        setShowCustomProduct(false);
        setCustomProduct({
            name: '',
            netPrice: 0,
            vat: 27,
            unit: 'db',
            quantity: 1,
            isCustom: true,
        });
        setErrors({});
        onClose();
    }, [onClose]);

    // Check for stock warnings - only warn if stock management is on, stock is low, and backorder is not allowed
    const stockWarnings = selectedProducts.filter(product => 
        product.manageStock && 
        product.stock !== null && 
        product.stock <= 0 && 
        !product.backorder
    );

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    margin: { xs: 1, sm: 2 },
                    maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
                    borderRadius: { xs: 2, sm: 1 },
                    width: { xs: 'calc(100vw - 16px)', sm: 'auto' }
                }
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Termék hozzáadása</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showCustomProduct}
                                onChange={(e) => setShowCustomProduct(e.target.checked)}
                            />
                        }
                        label="Egyedi termék"
                    />
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {/* Stock warnings */}
                    {stockWarnings.length > 0 && (
                        <Alert severity="warning">
                            <Typography variant="body2">
                                <strong>Figyelem!</strong> Az alábbi termékek készlete nem elegendő:
                            </Typography>
                            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                                {stockWarnings.map((product, index) => (
                                    <li key={index}>
                                        {product.name} (Készlet: {product.stock})
                                    </li>
                                ))}
                            </Box>
                        </Alert>
                    )}

                    {/* Product search */}
                    {!showCustomProduct && (
                        <Autocomplete
                            options={productOptions}
                            loading={searchLoading}
                            value={null}
                            inputValue={searchValue}
                            onInputChange={(_, newValue) => setSearchValue(newValue)}
                            onChange={(_, newValue) => handleProductSelect(newValue)}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{ mt: 2 }}
                                    label="Termék keresése"
                                    placeholder="Írja be legalább 3 karaktert..."
                                    helperText={searchValue.length > 0 && searchValue.length < 3 ? "Legalább 3 karakter szükséges" : ""}
                                />
                            )}
                            noOptionsText={searchValue.length < 3 ? "Írja be legalább 3 karaktert" : "Nincs találat"}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={option.uniqueKey || option.id} {...otherProps}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                            <Avatar
                                                src={option.coverUrl}
                                                variant="rounded"
                                                sx={{ width: 40, height: 40 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {option.name}
                                                    </Typography>
                                                {option.bio && (
                                                    <BioBadge style={{ marginLeft: 4 }} width={28} height={28} />
                                                )}
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">
                                                {fCurrency(option.netPrice)} / {option.unit}
                                                {option.manageStock && option.stock !== null && (
                                                    <span> • Készlet: {option.stock}</span>
                                                )}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                );
                            }}
                        />
                    )}

                    {/* Custom product form */}
                    {showCustomProduct && (
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Egyedi termék adatai
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Termék név"
                                    value={customProduct.name}
                                    onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    fullWidth
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Nettó ár"
                                        type="number"
                                        value={customProduct.netPrice}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, netPrice: parseFloat(e.target.value) || 0 }))}
                                        inputProps={{ min: 0, step: 0.01 }}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="ÁFA (%)"
                                        type="number"
                                        value={customProduct.vat}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, vat: parseInt(e.target.value) || 0 }))}
                                        inputProps={{ min: 0, max: 100 }}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Egység"
                                        value={customProduct.unit}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, unit: e.target.value }))}
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Mennyiség"
                                        type="number"
                                        value={customProduct.quantity}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                                        inputProps={{ min: 0.01, step: 0.01 }}
                                        required
                                        fullWidth
                                    />
                                </Stack>
                                <Button
                                    variant="contained"
                                    onClick={handleAddCustomProduct}
                                    disabled={!customProduct.name || !customProduct.netPrice || customProduct.netPrice <= 0}
                                    startIcon={<Iconify icon="mingcute:add-line" />}
                                >
                                    Egyedi termék hozzáadása
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {/* Selected products list */}
                    {selectedProducts.length > 0 && (
                        <>
                            <Divider />
                            <Typography variant="subtitle2">
                                Kiválasztott termékek ({selectedProducts.length})
                            </Typography>
                            <Stack spacing={2}>
                                {selectedProducts.map((product, index) => (
                                    <Box
                                        key={`${product.id}_${index}`}
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        {/* Mobile Layout */}
                                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                            {/* Row 1: Avatar + Product Info + Delete Button */}
                                            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                                                <Avatar
                                                    src={product.coverUrl}
                                                    variant="rounded"
                                                    sx={{ width: 48, height: 48 }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.name}
                                                        </Typography>
                                                        {product.bio && (
                                                            <BioBadge style={{ marginLeft: 4 }} width={28} height={28} />
                                                        )}
                                                        {product.isCustom && (
                                                            <Chip
                                                                label="Egyedi"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Stack>
                                                    {product.manageStock && product.stock !== null && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Jelenlegi készlet: {product.stock}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    sx={{ minWidth: 'auto', p: 1 }}
                                                >
                                                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                                </Button>
                                            </Stack>

                                            {/* Row 2: Form Fields (2x2 grid) */}
                                            <Stack spacing={2}>
                                                <Stack direction="row" spacing={2}>
                                                    <TextField
                                                        label="Nettó egységár"
                                                        type="number"
                                                        size="small"
                                                        value={product.netPrice}
                                                        onChange={(e) => handleProductChange(index, 'netPrice', parseFloat(e.target.value) || 0)}
                                                        error={!!errors[`${index}_netPrice`]}
                                                        helperText={errors[`${index}_netPrice`]}
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{ flex: 1 }}
                                                    />
                                                    <TextField
                                                        label="ÁFA (%)"
                                                        type="number"
                                                        size="small"
                                                        value={product.vat}
                                                        onChange={(e) => handleProductChange(index, 'vat', parseInt(e.target.value) || 0)}
                                                        error={!!errors[`${index}_vat`]}
                                                        helperText={errors[`${index}_vat`]}
                                                        inputProps={{ min: 0, max: 100 }}
                                                        sx={{ flex: 1 }}
                                                    />
                                                </Stack>
                                                <Stack direction="row" spacing={2}>
                                                    <TextField
                                                        label="Egység"
                                                        size="small"
                                                        value={product.unit}
                                                        onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                                                        sx={{ flex: 1 }}
                                                    />
                                                    <TextField
                                                        label="Mennyiség"
                                                        type="number"
                                                        size="small"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        error={!!errors[`${index}_quantity`]}
                                                        helperText={errors[`${index}_quantity`]}
                                                        inputProps={{ min: 0.01, step: 0.01 }}
                                                        sx={{ flex: 1 }}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </Box>

                                        {/* Desktop Layout */}
                                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <Avatar
                                                    src={product.coverUrl}
                                                    variant="rounded"
                                                    sx={{ width: 48, height: 48 }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {product.name}
                                                        </Typography>
                                                        {product.bio && (
                                                            <BioBadge style={{ marginLeft: 4 }} width={28} height={28} />
                                                        )}
                                                        {product.isCustom && (
                                                            <Chip
                                                                label="Egyedi"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Stack>
                                                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                        <TextField
                                                            label="Nettó egységár"
                                                            type="number"
                                                            size="small"
                                                            value={product.netPrice}
                                                            onChange={(e) => handleProductChange(index, 'netPrice', parseFloat(e.target.value) || 0)}
                                                            error={!!errors[`${index}_netPrice`]}
                                                            helperText={errors[`${index}_netPrice`]}
                                                            inputProps={{ min: 0, step: 0.01 }}
                                                            sx={{ width: 120 }}
                                                        />
                                                        <TextField
                                                            label="Egység"
                                                            size="small"
                                                            value={product.unit}
                                                            onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                                                            sx={{ width: 80 }}
                                                        />
                                                        <TextField
                                                            label="ÁFA (%)"
                                                            type="number"
                                                            size="small"
                                                            value={product.vat}
                                                            onChange={(e) => handleProductChange(index, 'vat', parseInt(e.target.value) || 0)}
                                                            error={!!errors[`${index}_vat`]}
                                                            helperText={errors[`${index}_vat`]}
                                                            inputProps={{ min: 0, max: 100 }}
                                                            sx={{ width: 80 }}
                                                        />
                                                        <TextField
                                                            label="Mennyiség"
                                                            type="number"
                                                            size="small"
                                                            value={product.quantity}
                                                            onChange={(e) => handleProductChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                            error={!!errors[`${index}_quantity`]}
                                                            helperText={errors[`${index}_quantity`]}
                                                            inputProps={{ min: 0.01, step: 0.01 }}
                                                            sx={{ width: 100 }}
                                                        />
                                                    </Stack>
                                                    {product.manageStock && product.stock !== null && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                            Jelenlegi készlet: {product.stock}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    sx={{ minWidth: 'auto', p: 1 }}
                                                >
                                                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
                p: { xs: 2, sm: 3 }
            }}>
                <Button 
                    onClick={handleClose} 
                    color="inherit"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Mégse
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={selectedProducts.length === 0 || Object.keys(errors).length > 0}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Termékek hozzáadása ({selectedProducts.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
}