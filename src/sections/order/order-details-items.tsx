import type { CardProps } from '@mui/material/Card';
import type { IOrderProductItem } from 'src/types/order';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { Chip, Link, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import BioBadge from 'src/components/bio-badge/bio-badge';

import { type ProductForOrder, ProductSelectionModal } from './product-selection-modal';

// ----------------------------------------------------------------------

type BundleItemsProps = {
    bundleItems: NonNullable<IOrderProductItem['bundleItems']>;
    parentQuantity: number;
    userType: 'public' | 'vip' | 'company';
    isMobile?: boolean;
};

function BundleItems({ bundleItems, parentQuantity, userType, isMobile }: Readonly<BundleItemsProps>) {
    if (!bundleItems || bundleItems.length === 0) return null;

    const getProperPrice = (item: NonNullable<IOrderProductItem['bundleItems']>[0]) => {
        if (!item.product) return 0;
        switch (userType) {
            case 'company':
            case 'vip':
                return item.product.netPrice;
            default:
                return item.product.grossPrice;
        }
    };

    return (
        <Box sx={{ ml: isMobile ? 0 : 7, mt: 1, mb: 1 }}>
            {bundleItems.map((bundleItem, idx) => {
                const scaledQty = bundleItem.qty * parentQuantity;
                const price = getProperPrice(bundleItem);
                const denyMobile = true;

                return (
                    <Box
                        key={`${bundleItem.productId}-${idx}`}
                        sx={[
                            (theme) => ({
                                p: isMobile ? 1.5 : 2,
                                borderLeft: `3px solid ${theme.vars.palette.divider}`,
                                backgroundColor: theme.vars.palette.action.hover,
                                borderRadius: 1,
                                mb: 1,
                            }),
                        ]}
                    >
                        {!denyMobile && isMobile ? (
                            // Mobile layout for bundle item
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    src={bundleItem.product?.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                    variant="rounded"
                                    sx={{ width: 28, height: 28, flexShrink: 0 }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
                                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                            {bundleItem.product?.name || 'Ismeretlen termék'}
                                        </Typography>
                                        {bundleItem.product?.bio && (
                                            <BioBadge width={20} height={12} />
                                        )}
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        {`${fCurrency(price)} / ${bundleItem.product?.unit || 'db'}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                        {scaledQty.toFixed(scaledQty % 1 === 0 ? 0 : 1)} {bundleItem.product?.unit || 'db'}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            // Desktop layout for bundle item
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={bundleItem.product?.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                    variant="rounded"
                                    sx={{ width: 32, height: 32, mr: 2 }}
                                />
                                <ListItemText
                                    primary={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography component="span" variant="caption" sx={{ fontWeight: 500 }}>
                                                {bundleItem.product?.name || 'Ismeretlen termék'}
                                            </Typography>
                                            {bundleItem.product?.bio && (
                                                <BioBadge width={24} height={14} />
                                            )}
                                        </Stack>
                                    }
                                    secondary={`${fCurrency(price)} / ${bundleItem.product?.unit || 'db'}`}
                                    slotProps={{
                                        primary: { sx: { typography: 'caption' } },
                                        secondary: {
                                            sx: { mt: 0.25, color: 'text.disabled', fontSize: '0.75rem' },
                                        },
                                    }}
                                />
                                <Box sx={{ width: 150, textAlign: 'right', typography: 'caption', fontWeight: 500 }}>
                                    {scaledQty.toFixed(scaledQty % 1 === 0 ? 0 : 1)} {bundleItem.product?.unit || 'db'} ({parentQuantity} x {bundleItem.qty} {bundleItem.product?.unit || 'db'})
                                </Box>
                                
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

// ----------------------------------------------------------------------

type Props = CardProps & {
    taxes?: number;
    shipping?: number;
    discount?: number;
    subtotal?: number;
    totalAmount?: number;
    surcharge?: number;
    payed_amount?: number;
    items?: IOrderProductItem[];
    isEditing?: boolean;
    isSurchargeEditable?: boolean;
    editable?: boolean;
    onItemChange?: (itemId: string, field: 'netPrice' | 'grossPrice' | 'quantity', value: number) => void;
    onItemDelete?: (itemId: string) => void;
    onItemAdd?: (products: ProductForOrder[]) => void;
    onSurchargeChange?: (value: number) => void;
    onShippingChange?: (value: number) => void;
    onDiscountChange?: (value: number) => void;
    onSave?: () => void;
    onCancel?: () => void;
    onStartEdit?: () => void;
    userType?: 'public' | 'vip' | 'company';
    userDiscountPercent?: number;
};

export function OrderDetailsItems({
    sx,
    taxes,
    shipping,
    discount,
    subtotal,
    surcharge,
    payed_amount,
    items = [],
    totalAmount,
    isEditing,
    isSurchargeEditable = true,
    editable,
    onItemChange,
    onItemDelete,
    onItemAdd,
    onSurchargeChange,
    onShippingChange,
    onDiscountChange,
    onSave,
    onCancel,
    onStartEdit,
    userType = 'public',
    userDiscountPercent = 0,
    ...other
}: Props) {
    const [editErrors, setEditErrors] = useState<Record<string, { netPrice?: string; grossPrice?: string; quantity?:string }>>({});
    const [surchargeError, setSurchargeError] = useState<string>('');
    const [shippingError, setShippingError] = useState<string>('');
    const [discountError, setDiscountError] = useState<string>('');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const handleFieldChange = (itemId: string, field: 'netPrice' | 'grossPrice' | 'quantity', value: string) => {
        const numValue = parseFloat(value);

        // Validate the input
        const errors = { ...editErrors };
        if (!errors[itemId]) errors[itemId] = {};

        if (isNaN(numValue) || numValue < 0) {
            errors[itemId][field] = `${field === 'netPrice' || field === 'grossPrice' ? 'Ár' : 'Mennyiség'} nem lehet negatív`;
        } else {
            delete errors[itemId][field];
            if (Object.keys(errors[itemId]).length === 0) {
                delete errors[itemId];
            }
        }

        setEditErrors(errors);

        // Call the parent handler if the value is valid
        if (!isNaN(numValue) && numValue >= 0 && onItemChange) {
            onItemChange(itemId, field, numValue);
        }
    };

    const handleSurchargeChange = (value: string) => {
        const numValue = parseFloat(value);

        if (isNaN(numValue) || numValue < 0) {
            setSurchargeError('Zárolási felár nem lehet negatív');
        } else {
            setSurchargeError('');
            if (onSurchargeChange) {
                onSurchargeChange(numValue);
            }
        }
    };

    const handleShippingChange = (value: string) => {
        const numValue = parseFloat(value);

        if (isNaN(numValue) || numValue < 0) {
            setShippingError('Szállítási költség nem lehet negatív');
        } else {
            setShippingError('');
            if (onShippingChange) {
                onShippingChange(numValue);
            }
        }
    };

    const handleDiscountChange = (value: string) => {
        const numValue = parseFloat(value);

        if (isNaN(numValue) || numValue < 0) {
            setDiscountError('Kedvezmény nem lehet negatív');
        } else {
            setDiscountError('');
            if (onDiscountChange) {
                onDiscountChange(numValue);
            }
        }
    };

    const handleAddProducts = (products: ProductForOrder[]) => {
        if (onItemAdd) {
            onItemAdd(products);
        }
        setIsProductModalOpen(false);
    };

    const getProperPriceByRole = (item: IOrderProductItem) => {
        switch (userType) {
            case 'company':
                return item.netPrice;
            case 'vip':
                return item.netPrice;
            default:
                return item.grossPrice;
        }
    };

    const getProperSubtotalByRole = () => {
        switch (userType) {
            case 'company':
            case 'vip':
                return items.reduce((acc, item) => acc + (item.netPrice * item.quantity), 0);
            default:
                return items.reduce((acc, item) => acc + (item.grossPrice * item.quantity), 0);
        }
    };

    const getTaxesTotal = () => items.reduce((acc, item) =>  acc + (item.grossPrice - item.netPrice) * item.quantity, 0) + getShippingTax();

    const getShippingTax = () => shipping && userType != 'vip' ? Math.round(shipping - (shipping / 1.27)) : 0;

    const getGrossTotal = () => {
        const netGrossTotal = items.reduce((acc, item) => acc + (item.grossPrice * item.quantity), 0);
        return netGrossTotal + (shipping || 0) + (surcharge || 0) - (discount || 0);
    };

    const hasErrors = Object.keys(editErrors).length > 0 || !!surchargeError || !!shippingError || !!discountError;
    
    const renderTotal = () => (
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                gap: { xs: 0, md: 2 },
                display: 'flex',
                textAlign: 'right',
                typography: 'body2',
                alignItems: 'flex-end',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Termék végösszeg</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 }, typography: 'subtitle2', fontSize: { xs: '0.875rem', md: '1rem' } }}>{fCurrency(getProperSubtotalByRole())}</Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Szállítás</Box>
                
                {isEditing ? (
                    <Box sx={{ width: { xs: 'auto', md: 160 } }}>
                        <TextField
                            size="small"
                            type="number"
                            value={shipping || 0}
                            onChange={(e) => handleShippingChange(e.target.value)}
                            error={!!shippingError}
                            helperText={shippingError}
                            sx={{ width: '100%', maxWidth: { xs: 120, md: 'none' } }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: { xs: 'auto', md: 160 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                        {shipping ? fCurrency(shipping) : '-'}
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Kedvezmény</Box>
                
                {isEditing ? (
                    <Box sx={{ width: { xs: 'auto', md: 160 } }}>
                        <TextField
                            size="small"
                            type="number"
                            value={discount || 0}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            error={!!discountError}
                            helperText={discountError}
                            sx={{ width: '100%', maxWidth: { xs: 120, md: 'none' } }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: { xs: 'auto', md: 160 }, fontSize: { xs: '0.875rem', md: '1rem' }, ...(discount && { color: 'error.main' }) }}>
                        {discount ? `- ${fCurrency(discount)}` : '-'}
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Adó</Box>

                <Box sx={{ width: { xs: 'auto', md: 160 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>{fCurrency(getTaxesTotal()) || '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Zárolási felár</Box>

                {isEditing && isSurchargeEditable ? (
                    <Box sx={{ width: { xs: 'auto', md: 160 } }}>
                        <TextField
                            size="small"
                            type="number"
                            value={surcharge || 0}
                            onChange={(e) => handleSurchargeChange(e.target.value)}
                            error={!!surchargeError}
                            helperText={surchargeError}
                            sx={{ width: '100%', maxWidth: { xs: 120, md: 'none' } }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: { xs: 'auto', md: 160 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                        {surcharge ? fCurrency(surcharge) : '-'}
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Már kifizetett összeg</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 }, typography: 'subtitle2', fontSize: { xs: '0.875rem', md: '1rem' } }}>{fCurrency(payed_amount) || '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', typography: 'subtitle1', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <div style={{ fontSize: 'inherit' }}>Br. végösszeg</div>
                <Box sx={{ width: { xs: 'auto', md: 160 }, fontSize: { xs: '0.9375rem', md: '1rem' } }}>{fCurrency(getGrossTotal()) || '-'}</Box>
            </Box>
        </Box>
    );

    return (
        <>
            <Card sx={sx} {...other}>
                <CardHeader
                    title="Részletek"
                    action={
                        editable === true && (
                            isEditing ? (
                                <Stack direction={{ xs: 'row', sm: 'row' }} alignItems="center" justifyContent="center" spacing={1}>
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        href='#'
                                        //startIcon={<Iconify icon="mingcute:add-line" />}
                                        onClick={() => setIsProductModalOpen(true)}
                                    >
                                        <Iconify icon="solar:add-circle-bold" color='primary' width={24} height={24}/>
                                    </IconButton>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        size="small"
                                        onClick={onCancel}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Mégse
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={onSave}
                                        disabled={hasErrors}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Mentés
                                    </Button>
                                </Stack>
                            ) : (
                                <IconButton onClick={onStartEdit}>
                                    <Iconify icon="solar:pen-bold" />
                                </IconButton>
                            )
                        )
                    }
                />

                {/* Mobile: Show total at top */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, borderBottom: (theme) => `dashed 2px ${theme.vars.palette.background.neutral}` }}>
                    {renderTotal()}
                </Box>

                <Scrollbar>
                    {items.map((item) => (
                        <Box
                            key={item.id + '_' + item.name}
                            sx={[
                                (theme) => ({
                                    p: { xs: 1.5, md: 3 },
                                    borderBottom: `dashed 2px ${theme.vars.palette.background.neutral}`,
                                }),
                            ]}
                        >
                            {/* Mobile Layout */}
                            <Box sx={{ 
                                display: { xs: 'block', md: 'none' },
                                width: '100%'
                            }}>
                                {/* Row 1: Avatar + Title + Quantity + Subtotal */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        src={item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                        variant="rounded"
                                        sx={{ width: 36, height: 36, flexShrink: 0 }}
                                    />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {item.slug.length > 0 ? (
                                            <Link
                                                target="_blank"
                                                href={paths.dashboard.product.edit(item.slug)}
                                                sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { fontWeight: 600, textDecoration: 'none' } }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                                                    {item.name}
                                                </Typography>
                                            </Link>
                                        ) : (
                                            <Box>
                                                <Chip label="Egyedi termék" size="small" color='primary' sx={{ height: 16, fontSize: '0.625rem', mb: 0.5 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                                                    {item.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        {!isEditing && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                                                {`${fCurrency(getProperPriceByRole(item))} / ${item.unit}`}{item.note && ` | ${item.note}`}
                                            </Typography>
                                        )}
                                    </Box>
                                    {!isEditing && (
                                        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                                            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)} {item.unit}
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                                {userType === 'company' || userType === 'vip' ? fCurrency(item.netPrice * item.quantity) : fCurrency(item.grossPrice * item.quantity)}
                                            </Typography>
                                        </Box>
                                    )}
                                    {isEditing && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onItemDelete?.(item.id)}
                                            sx={{ p: 0.5, flexShrink: 0 }}
                                        >
                                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                        </IconButton>
                                    )}
                                </Box>

                                {/* Row 2: Price + Quantity (when editing) */}
                                {isEditing && (
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label={userType == 'company' || userType == 'vip' ? 'Nettó ár' : 'Bruttó ár'}
                                                defaultValue={getProperPriceByRole(item)}
                                                onChange={(e) => handleFieldChange(item.id, (userType == 'company' || userType == 'vip') ? 'netPrice' : 'grossPrice', e.target.value)}
                                                error={(userType == 'company' || userType == 'vip') ? !!editErrors[item.id]?.netPrice : !!editErrors[item.id]?.grossPrice}
                                                helperText={userType == 'company' || userType == 'vip' ? editErrors[item.id]?.netPrice : editErrors[item.id]?.grossPrice}
                                                sx={{ width: '100%', '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.75 } }}
                                                inputProps={{ min: 0, step: 0.01 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', fontSize: '0.7rem' }}>
                                                / {item.unit} {item.note && ` | ${item.note}`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Mennyiség"
                                                defaultValue={item.quantity}
                                                onChange={(e) => handleFieldChange(item.id, 'quantity', e.target.value)}
                                                error={!!editErrors[item.id]?.quantity}
                                                helperText={editErrors[item.id]?.quantity}
                                                sx={{ width: '100%', '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.75 } }}
                                                inputProps={{ min: 0, step: item.quantity % 1 === 0 ? 1 : 0.01 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', fontSize: '0.7rem' }}>
                                                {item.unit}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Row 3: Subtotal (when editing) */}
                                {isEditing && (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                            {userType === 'company' || userType === 'vip' ? fCurrency(item.netPrice * item.quantity) : fCurrency(item.grossPrice * item.quantity)}
                                        </Typography>
                                    </Box>
                                )}
                                
                                {/* Bundle Items - Mobile 
                                {item.type === 'bundle' && item.bundleItems && (
                                    <BundleItems 
                                        bundleItems={item.bundleItems} 
                                        parentQuantity={item.quantity} 
                                        userType={userType}
                                        isMobile
                                    />
                                )}*/}
                            </Box>

                            {/* Desktop Layout */}
                            <Box sx={{ 
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Avatar
                                    src={item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                    variant="rounded"
                                    sx={{ width: 48, height: 48, mr: 2 }}
                                />

                                <ListItemText
                                    primary={
                                        item.slug.length > 0 ?
                                            <Link
                                                target="_blank"
                                                href={paths.dashboard.product.edit(item.slug)}
                                                sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { fontWeight: 600, textDecoration: 'none' } }}
                                            >
                                                {item.name}
                                            </Link>
                                            :
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography component="span" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                                    {item.name}
                                                </Typography>
                                                <Chip label="Egyedi termék" size="small" color='primary' />
                                            </Stack>
                                    }
                                    secondary={
                                        isEditing ? (
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label={userType == 'company' || userType == 'vip' ? 'Nettó ár' : 'Bruttó ár'}
                                                    defaultValue={getProperPriceByRole(item)}
                                                    onBlur={(e) => handleFieldChange(item.id, (userType == 'company' || userType == 'vip') ? 'netPrice' : 'grossPrice', e.target.value)}
                                                    error={(userType == 'company' || userType == 'vip') ? !!editErrors[item.id]?.netPrice : !!editErrors[item.id]?.grossPrice}
                                                    helperText={userType == 'company' || userType == 'vip' ? editErrors[item.id]?.netPrice : editErrors[item.id]?.grossPrice}
                                                    sx={{ width: 100 }}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                />
                                                <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>/ {item.unit} {item.note && ` | ${item.note}`}</Box>
                                            </Box>
                                        ) : (
                                            `${fCurrency(getProperPriceByRole(item))} / ${item.unit}` + (item.note ? ` | ${item.note}` : '')
                                        )
                                    }
                                    slotProps={{
                                        primary: { sx: { typography: 'body2' } },
                                        secondary: {
                                            sx: { mt: 0.5, color: isEditing ? 'inherit' : 'text.disabled' },
                                        },
                                    }}
                                />

                                {isEditing ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, width: 140 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Mennyiség"
                                            defaultValue={item.quantity}
                                            onBlur={(e) => handleFieldChange(item.id, 'quantity', e.target.value)}
                                            error={!!editErrors[item.id]?.quantity}
                                            helperText={editErrors[item.id]?.quantity}
                                            sx={{ width: '100%' }}
                                            inputProps={{ min: 0, step: item.quantity % 1 === 0 ? 1 : 0.01 }}
                                        />
                                        <Box sx={{ typography: 'caption', color: 'text.disabled' }}>{item.unit}</Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                                        {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)} {item.unit}
                                    </Box>
                                )}

                                <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                                    {userType === 'company' || userType === 'vip' ? fCurrency(item.netPrice * item.quantity) : fCurrency(item.grossPrice * item.quantity)}
                                </Box>

                                {isEditing && (
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => onItemDelete?.(item.id)}
                                        sx={{ ml: 1 }}
                                    >
                                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                    </IconButton>
                                )}
                            </Box>
                            
                            {/* Bundle Items - Desktop */}
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                {item.type === 'bundle' && item.bundleItems && (
                                    <BundleItems 
                                        bundleItems={item.bundleItems} 
                                        parentQuantity={item.quantity} 
                                        userType={userType}
                                        isMobile={false}
                                    />
                                )}
                            </Box>
                        </Box>
                    ))}
                </Scrollbar>

                {renderTotal()}
            </Card>

            <ProductSelectionModal
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onAddProducts={handleAddProducts}
                userType={userType}
                discountPercent={userDiscountPercent}
            />
        </>
    );
}
