"use client"
import { Card, CardContent, CardHeader, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

type PurchaseLimitCardProps = {
    publicLimit?: number;
    vipLimit?: number;
    companyLimit?: number;
};

export function PurchaseLimitCard({ publicLimit = 5000, vipLimit = 5000, companyLimit = 5000 }: PurchaseLimitCardProps) {
    const [limits, setLimits] = useState({
        public: publicLimit,
        vip: vipLimit,
        company: companyLimit
    });

    const handleLimitChange = (type: 'public' | 'vip' | 'company', value: number) => {
        // Prevent leading zeros and negative values
        let normalizedValue = Number(String(value).replace(/^0+(?=\d)/, ''));
        normalizedValue = Math.max(1, isNaN(normalizedValue) ? 1 : normalizedValue);
        setLimits(prev => ({ ...prev, [type]: normalizedValue }));
    };

    return (
        <Card>
            <CardHeader title="Vásárlási korlát" />
            <CardContent>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>Publikus</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={limits.public}
                            onChange={e => handleLimitChange('public', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Ft</InputAdornment>
                            }}
                            inputProps={{
                                min: 1
                            }}
                    />
                    </Stack>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>VIP</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={limits.vip}
                            onChange={e => handleLimitChange('vip', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Ft</InputAdornment>
                            }}
                            inputProps={{
                                min: 1
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={6} sx={{width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>Cég</Typography>
                        <TextField
                            type="number"
                            sx={{ minWidth: '30%' }}
                            value={limits.company}
                            onChange={e => handleLimitChange('company', Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Ft</InputAdornment>
                            }}
                            inputProps={{
                                min: 1
                            }}
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}