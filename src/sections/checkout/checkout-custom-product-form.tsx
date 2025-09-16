import type { ICheckoutItem } from 'src/types/checkout';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { fCurrency } from 'src/utils/format-number';

import { useGetOption } from 'src/actions/options';

import { Iconify } from 'src/components/iconify';

import { OptionsEnum } from 'src/types/option';

// ----------------------------------------------------------------------

type CustomProductFormProps = {
    onAddCustomProduct: (item: ICheckoutItem) => void;
};

export function CheckoutCustomProductForm({ onAddCustomProduct }: CustomProductFormProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        note: '',
    });

    // Get the base price for custom products
    const { option: customProductBasePrice } = useGetOption(OptionsEnum.CustomProductBasePrice);

    const parseQuantityAndUnit = (input: string): { quantity: number; unit: string } => {
        const trimmed = input.trim();

        // If empty or only whitespace, return default
        if (!trimmed) {
            return { quantity: 1, unit: 'db' };
        }

        // Regex to match number followed by optional unit
        // Supports: "2", "2 kg", "2kg", "2 láda", "2láda", etc.
        const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúöüűÁÉÍÓÚÖÜŰ]*)/);

        if (match) {
            const quantity = parseFloat(match[1].replace(',', '.')) || 1;
            const unit = match[2] || 'db';
            return { quantity, unit };
        }

        // If no number found, try to extract unit only and default quantity to 1
        const unitMatch = trimmed.match(/^([a-zA-ZáéíóúöüűÁÉÍÓÚÖÜŰ]+)/);
        if (unitMatch) {
            return { quantity: 1, unit: unitMatch[1] };
        }

        // Fallback: treat entire input as unit with quantity 1
        return { quantity: 1, unit: trimmed || 'db' };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            return;
        }

        const { quantity, unit } = parseQuantityAndUnit(formData.quantity);

        // Use the configured base price for custom products (fixed price, not affected by quantity)
        const basePrice = customProductBasePrice || 0;

        // Create a custom product item
        const customItem: ICheckoutItem = {
            id: Date.now().toString(), // Temporary ID for custom products
            name: formData.name.trim(),
            grossPrice: basePrice,
            netPrice: basePrice / 1.27, // Assuming 27% VAT for custom products
            vatPercent:27,
            unit,
            coverUrl: '', // No image for custom products
            quantity,
            available: 999, // Set high availability for custom products
            subtotal: basePrice, // Fixed price regardless of quantity
            note: formData.note.trim() || undefined,
            minQuantity: 1,
            maxQuantity: 999,
            stepQuantity: 1,
            custom: true,
        };

        onAddCustomProduct(customItem);

        // Reset form
        setFormData({ name: '', quantity: '', note: '' });
        setShowForm(false);
    };

    const handleCancel = () => {
        setFormData({ name: '', quantity: '', note: '' });
        setShowForm(false);
    };

    return (
        <Card sx={{ mt: 3 }}>
            <CardHeader
                title="Extra termékek"
                subheader="Nem találtál valamit? Add hozzá itt, és mi megpróbáljuk beszerezni!"
                action={
                    customProductBasePrice && customProductBasePrice > 0 ? (
                        <Typography variant="caption" color="text.secondary">
                            Alapár: {fCurrency(customProductBasePrice)}
                        </Typography>
                    ) : null
                }
                sx={{
                    '& .MuiCardHeader-title': {
                        fontSize: '1.125rem',
                        fontWeight: 600,
                    },
                    '& .MuiCardHeader-subheader': {
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                    },
                }}
            />

            <CardContent>
                {!showForm ? (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Iconify icon="solar:add-circle-bold" />}
                        onClick={() => setShowForm(true)}
                        sx={{
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            py: 1.5,
                            px: 3,
                            '&:hover': {
                                borderStyle: 'dashed',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                        }}
                    >
                        Új hozzáadása
                    </Button>
                ) : (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {customProductBasePrice && customProductBasePrice > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                💡 Az egyedi termékek fix ára: {fCurrency(customProductBasePrice)}{' '}
                                (mennyiségtől függetlenül)
                            </Typography>
                        )}

                        <TextField
                            fullWidth
                            label="Termék neve"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="pl. Bio alma"
                            variant="outlined"
                            size="small"
                        />

                        <TextField
                            fullWidth
                            label="Mennyiség"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="pl. 2 kg, 1 láda, 5 db"
                            variant="outlined"
                            size="small"
                            helperText="Adj meg mennyiséget és egységet (pl. 2 kg, 1 láda, 5 db)"
                        />

                        <TextField
                            fullWidth
                            label="Megjegyzés"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="További információk a termékről..."
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                        />

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                                type="button"
                                variant="outlined"
                                color="inherit"
                                onClick={handleCancel}
                                size="small"
                            >
                                Mégse
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={!formData.name.trim()}
                                size="small"
                            >
                                Hozzáadás
                            </Button>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
