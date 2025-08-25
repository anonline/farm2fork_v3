"use client"

import { useState, useEffect } from "react";

import { Card, Stack, TextField, CardHeader, Typography, CardContent, InputAdornment } from "@mui/material";

import { fCurrency } from "src/utils/format-number";

type CustomProductPriceCardProps = {
    customProductBasePrice?: number;
    onPriceChange?: (price: number) => void;
};

export function CustomProductPriceCard({ 
    customProductBasePrice = 0,
    onPriceChange 
}: CustomProductPriceCardProps) {
    const [price, setPrice] = useState(customProductBasePrice);

    // Update local state when props change
    useEffect(() => {
        setPrice(customProductBasePrice);
    }, [customProductBasePrice]);

    const handlePriceChange = (value: number) => {
        // Prevent leading zeros and negative values
        let normalizedValue = Number(String(value).replace(/^0+(?=\d)/, ''));
        normalizedValue = Math.max(0, isNaN(normalizedValue) ? 0 : normalizedValue);
        // Limit to reasonable price (max 1,000,000 HUF)
        normalizedValue = Math.min(1000000, normalizedValue);
        
        setPrice(normalizedValue);
        
        // Notify parent component of changes
        onPriceChange?.(normalizedValue);
    };

    return (
        <Card>
            <CardHeader 
                title="Egyedi termék alapár" 
                subheader="Az egyedi termékekhez használt fix alapár beállítása"
            />
            <CardContent>
                <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Stack spacing={1}>
                        <Typography variant="body1">Alapár</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Fix ár mennyiségtől függetlenül
                        </Typography>
                    </Stack>
                    <TextField
                        type="number"
                        sx={{ minWidth: '40%' }}
                        value={price}
                        onChange={e => handlePriceChange(Number(e.target.value))}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Ft</InputAdornment>
                        }}
                        inputProps={{
                            min: 0,
                            max: 1000000,
                            step: 1
                        }}
                        helperText={price > 0 ? `Jelenlegi érték: ${fCurrency(price)}` : 'Adjon meg egy alapárat'}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}
