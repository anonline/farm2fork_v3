"use client"

import { useState, useEffect } from "react";

import { Card, Stack, TextField, CardHeader, Typography, CardContent, InputAdornment } from "@mui/material";

type SurchargeCardProps = {
    publicSurcharge?: number;
    vipSurcharge?: number;
    companySurcharge?: number;
    onSurchargesChange?: (surcharges: { public: number; vip: number; company: number }) => void;
};

export function SurchargeCard({ 
    publicSurcharge = 0, 
    vipSurcharge = 0, 
    companySurcharge = 0,
    onSurchargesChange 
}: SurchargeCardProps) {
    const [surcharges, setSurcharges] = useState({
        public: publicSurcharge,
        vip: vipSurcharge,
        company: companySurcharge
    });

    // Update local state when props change
    useEffect(() => {
        setSurcharges({
            public: publicSurcharge,
            vip: vipSurcharge,
            company: companySurcharge
        });
    }, [publicSurcharge, vipSurcharge, companySurcharge]);

    const handleSurchargeChange = (type: 'public' | 'vip' | 'company', value: number) => {
        // Prevent leading zeros and negative values, allow decimals
        let normalizedValue = Number(String(value).replace(/^0+(?=\d)/, ''));
        normalizedValue = Math.max(0, isNaN(normalizedValue) ? 0 : normalizedValue);
        // Limit to reasonable percentage (max 100%)
        normalizedValue = Math.min(100, normalizedValue);
        
        const newSurcharges = { ...surcharges, [type]: normalizedValue };
        setSurcharges(newSurcharges);
        
        // Notify parent component of changes
        onSurchargesChange?.(newSurcharges);
    };

    return (
        <Card>
            <CardHeader title="Felár" />
            <CardContent>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>Publikus</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={surcharges.public}
                            onChange={e => handleSurchargeChange('public', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.1
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>VIP</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={surcharges.vip}
                            onChange={e => handleSurchargeChange('vip', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.1
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>Cég</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={surcharges.company}
                            onChange={e => handleSurchargeChange('company', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.1
                            }}
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
