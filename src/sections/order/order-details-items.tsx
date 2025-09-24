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

import { type ProductForOrder, ProductSelectionModal } from './product-selection-modal';

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
    onItemChange?: (itemId: string, field: 'price' | 'quantity', value: number) => void;
    onItemDelete?: (itemId: string) => void;
    onItemAdd?: (products: ProductForOrder[]) => void;
    onSurchargeChange?: (value: number) => void;
    onSave?: () => void;
    onCancel?: () => void;
    onStartEdit?: () => void;
    userType?: 'public' | 'vip' | 'company';
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
    onSave,
    onCancel,
    onStartEdit,
    userType = 'public',
    ...other
}: Props) {
    const [editErrors, setEditErrors] = useState<Record<string, { price?: string; quantity?: string }>>({});
    const [surchargeError, setSurchargeError] = useState<string>('');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const handleFieldChange = (itemId: string, field: 'price' | 'quantity', value: string) => {
        const numValue = parseFloat(value);

        // Validate the input
        const errors = { ...editErrors };
        if (!errors[itemId]) errors[itemId] = {};

        if (isNaN(numValue) || numValue <= 0) {
            errors[itemId][field] = `${field === 'price' ? 'Ár' : 'Mennyiség'} nem lehet nulla vagy negatív`;
        } else {
            delete errors[itemId][field];
            if (Object.keys(errors[itemId]).length === 0) {
                delete errors[itemId];
            }
        }

        setEditErrors(errors);

        // Call the parent handler if the value is valid
        if (!isNaN(numValue) && numValue > 0 && onItemChange) {
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

    const hasErrors = Object.keys(editErrors).length > 0 || !!surchargeError;
    const renderTotal = () => (
        <Box
            sx={{
                p: 3,
                gap: 2,
                display: 'flex',
                textAlign: 'right',
                typography: 'body2',
                alignItems: 'flex-end',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary' }}>Termék végösszeg</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 }, typography: 'subtitle2' }}>{fCurrency(subtotal) || '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary' }}>Szállítás</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 } }}>
                    {shipping ? fCurrency(shipping) : '-'}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary' }}>Kedvezmény</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 }, ...(discount && { color: 'error.main' }) }}>
                    {discount ? `- ${fCurrency(discount)}` : '-'}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary' }}>Adó</Box>

                <Box sx={{ width: { xs: 'auto', md: 160 } }}>{taxes ? fCurrency(taxes) : '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: { xs: 'flex-start', md: 'center' } }}>
                <Box sx={{ color: 'text.secondary' }}>Zárolási felár</Box>

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
                    <Box sx={{ width: { xs: 'auto', md: 160 } }}>
                        {surcharge ? fCurrency(surcharge) : '-'}
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <Box sx={{ color: 'text.secondary' }}>Már kifizetett összeg</Box>
                <Box sx={{ width: { xs: 'auto', md: 160 }, typography: 'subtitle2' }}>{fCurrency(payed_amount) || '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', typography: 'subtitle1', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                <div>Br. végösszeg</div>
                <Box sx={{ width: { xs: 'auto', md: 160 } }}>{fCurrency(totalAmount) || '-'}</Box>
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

                <Scrollbar>
                    {items.map((item) => (
                        <Box
                            key={item.id + '_' + item.name}
                            sx={[
                                (theme) => ({
                                    p: 3,
                                    borderBottom: `dashed 2px ${theme.vars.palette.background.neutral}`,
                                }),
                            ]}
                        >
                            {/* Mobile Layout */}
                            <Box sx={{ 
                                display: { xs: 'block', md: 'none' },
                                width: '100%'
                            }}>
                                {/* Row 1: Avatar + Title */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        src={item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                                        variant="rounded"
                                        sx={{ width: 48, height: 48, mr: 2 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        {item.slug.length > 0 ? (
                                            <Link
                                                target="_blank"
                                                href={paths.dashboard.product.edit(item.slug)}
                                                sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { fontWeight: 600, textDecoration: 'none' } }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {item.name}
                                                </Typography>
                                            </Link>
                                        ) : (
                                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {item.name}
                                                </Typography>
                                                <Chip label="Egyedi termék" size="small" color='primary' />
                                            </Stack>
                                        )}
                                        {!isEditing && (
                                            <Typography variant="caption" color="text.secondary">
                                                {`${fCurrency(getProperPriceByRole(item))} / ${item.unit}`}{item.note && ` | ${item.note}`}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Row 2: Price + Quantity */}
                                {isEditing && (
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Ár"
                                                defaultValue={getProperPriceByRole(item)}
                                                onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                                                error={!!editErrors[item.id]?.price}
                                                helperText={editErrors[item.id]?.price}
                                                sx={{ width: '100%' }}
                                                inputProps={{ min: 0, step: 0.01 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
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
                                                sx={{ width: '100%' }}
                                                inputProps={{ min: 0, step: item.quantity % 1 === 0 ? 1 : 0.01 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {item.unit}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Row 3: Quantity + Subtotal (when not editing) or just Subtotal + Delete (when editing) */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {!isEditing ? (
                                        <Typography variant="subtitle2">
                                            {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 2)} {item.unit}
                                        </Typography>
                                    ) : (
                                        <Box />
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2">
                                            {fCurrency(item.subtotal)}
                                        </Typography>
                                        {isEditing && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onItemDelete?.(item.id)}
                                            >
                                                <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
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
                                                    label="Ár"
                                                    defaultValue={getProperPriceByRole(item)}
                                                    onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                                                    error={!!editErrors[item.id]?.price}
                                                    helperText={editErrors[item.id]?.price}
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
                                            onChange={(e) => handleFieldChange(item.id, 'quantity', e.target.value)}
                                            error={!!editErrors[item.id]?.quantity}
                                            helperText={editErrors[item.id]?.quantity}
                                            sx={{ width: '100%' }}
                                            inputProps={{ min: 0, step: item.quantity % 1 === 0 ? 1 : 0.01 }}
                                        />
                                        <Box sx={{ typography: 'caption', color: 'text.disabled' }}>{item.unit}</Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                                        {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 2)} {item.unit}
                                    </Box>
                                )}

                                <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                                    {fCurrency(item.subtotal)}
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
                        </Box>
                    ))}
                </Scrollbar>

                {renderTotal()}
            </Card>

            <ProductSelectionModal
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onAddProducts={handleAddProducts}
            />
        </>
    );
}
