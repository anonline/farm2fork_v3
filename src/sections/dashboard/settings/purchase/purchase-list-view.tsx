"use client"

import { useState, useCallback } from "react";

import { Button, Stack } from "@mui/material";

import { paths } from "src/routes/paths";

import { DashboardContent } from "src/layouts/dashboard";
import { useGetOption, updateOption } from "src/actions/options";

import { toast } from "src/components/snackbar";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { OptionsEnum } from "src/types/option";

import { PurchaseLimitCard } from "./purchase-limit-card";
import { SurchargeCard } from "./surcharge-card";

export function PurchaseListView() {
    const {option:publicLimit, optionMutate: publicMutate} = useGetOption(OptionsEnum.MinimumPurchaseForPublic);
    const {option:vipLimit, optionMutate: vipMutate} = useGetOption(OptionsEnum.MinimumPurchaseForVIP);
    const {option:companyLimit, optionMutate: companyMutate} = useGetOption(OptionsEnum.MinimumPurchaseForCompany);
    
    const {option:publicSurcharge, optionMutate: publicSurchargeMutate} = useGetOption(OptionsEnum.SurchargePercentPublic);
    const {option:vipSurcharge, optionMutate: vipSurchargeMutate} = useGetOption(OptionsEnum.SurchargePercentVIP);
    const {option:companySurcharge, optionMutate: companySurchargeMutate} = useGetOption(OptionsEnum.SurchargePercentCompany);

    const [limits, setLimits] = useState({
        public: 0,
        vip: 0,
        company: 0
    });
    
    const [surcharges, setSurcharges] = useState({
        public: 0,
        vip: 0,
        company: 0
    });
    
    const [isSaving, setIsSaving] = useState(false);

    const handleLimitsChange = useCallback((newLimits: { public: number; vip: number; company: number }) => {
        setLimits(newLimits);
    }, []);

    const handleSurchargesChange = useCallback((newSurcharges: { public: number; vip: number; company: number }) => {
        setSurcharges(newSurcharges);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);
            
            // Update all options
            await Promise.all([
                updateOption(OptionsEnum.MinimumPurchaseForPublic, limits.public),
                updateOption(OptionsEnum.MinimumPurchaseForVIP, limits.vip),
                updateOption(OptionsEnum.MinimumPurchaseForCompany, limits.company),
                updateOption(OptionsEnum.SurchargePercentPublic, surcharges.public),
                updateOption(OptionsEnum.SurchargePercentVIP, surcharges.vip),
                updateOption(OptionsEnum.SurchargePercentCompany, surcharges.company)
            ]);

            // Mutate SWR cache to refresh data
            publicMutate();
            vipMutate();
            companyMutate();
            publicSurchargeMutate();
            vipSurchargeMutate();
            companySurchargeMutate();

            toast.success('A beállítások sikeresen mentve!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Hiba történt a mentés során!');
        } finally {
            setIsSaving(false);
        }
    }, [limits, surcharges, publicMutate, vipMutate, companyMutate, publicSurchargeMutate, vipSurchargeMutate, companySurchargeMutate]);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Vásárlási beállítások"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Beállítások'},
                    { name: 'Vásárlás' },
                ]}
                action={
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Mentés...' : 'Módosítások mentése'}
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Stack spacing={3}>
                <PurchaseLimitCard 
                    publicLimit={publicLimit || 5000} 
                    vipLimit={vipLimit || 5000}
                    companyLimit={companyLimit || 5000}
                    onLimitsChange={handleLimitsChange}
                />

                <SurchargeCard 
                    publicSurcharge={publicSurcharge || 0} 
                    vipSurcharge={vipSurcharge || 0}
                    companySurcharge={companySurcharge || 0}
                    onSurchargesChange={handleSurchargesChange}
                />
            </Stack>

        </DashboardContent>
    );
}