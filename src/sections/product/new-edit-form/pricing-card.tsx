import type { UseBooleanReturn } from "minimal-shared/hooks";

import { Card, Stack, Switch, Divider, Collapse, FormControlLabel } from "@mui/material";

import { RHFSwitch, RHFTextField } from "src/components/hook-form";

import EditCardHeader from "./card-header";

type PricingCardProps = {
    isOpen: UseBooleanReturn;
    handleGrossPriceChange: (event: React.FocusEvent<HTMLInputElement>) => void;
    handleStock: boolean;
    handleStockChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function PricingCard({ isOpen, handleGrossPriceChange, handleStock = false, handleStockChange }: Readonly<PricingCardProps>) {
    return (
        <Card>
            <EditCardHeader title="Árak és Készlet" isOpen={isOpen} sx={{ mb: 2 }} />

            <Divider />

            <Collapse in={isOpen.value}>

                <Stack spacing={3} sx={{ p: 3 }}>

                    <RHFTextField name="netPrice" label="Nettó alapár (Ft)" type="number" />
                    <RHFTextField name="vat" label="ÁFA (%)" type="number" />
                    <RHFTextField name="grossPrice" label="Bruttó alapár (Ft)" type="number" onBlur={handleGrossPriceChange} />
                    <RHFTextField name="salegrossPrice" label="Bruttó akciós Ár (Ft)" type="number" />

                    <Divider sx={{ my: 2 }} />

                    <RHFTextField name="netPriceVIP" label="VIP Nettó Ár (Ft)" type="number" />
                    <RHFTextField name="netPriceCompany" label="Céges Nettó Ár (Ft)" type="number" />

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                        label="Végtelen készlet"
                        sx={{ ml: 0 }}
                        control={
                            <Switch checked={!handleStock} onChange={handleStockChange} name="handleStock" />
                        }
                    />

                    <RHFTextField 
                        name="stock" 
                        label="Készlet" 
                        type="number" 
                        variant="outlined"
                        disabled={!handleStock} 
                        sx={{
                            '& .MuiInputBase-root': {
                                backgroundColor: handleStock ? 'transparent' : 'action.hover',
                            }
                        }}
                    />

                    <RHFSwitch name="backorder" label="Előrendelhető" />
                </Stack>
            </Collapse>
        </Card>
    );
}