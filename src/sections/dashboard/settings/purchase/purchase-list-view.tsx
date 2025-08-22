"use client"

import { useState, useCallback } from "react";

import { Button } from "@mui/material";

import { paths } from "src/routes/paths";

import { DashboardContent } from "src/layouts/dashboard";
import { useGetOption, updateOption } from "src/actions/options";

import { toast } from "src/components/snackbar";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { OptionsEnum } from "src/types/option";

import { PurchaseLimitCard } from "./purchase-limit-card";

export function PurchaseListView() {
    const {option:publicLimit, optionMutate: publicMutate} = useGetOption(OptionsEnum.MinimumPurchaseForPublic);
    const {option:vipLimit, optionMutate: vipMutate} = useGetOption(OptionsEnum.MinimumPurchaseForVIP);
    const {option:companyLimit, optionMutate: companyMutate} = useGetOption(OptionsEnum.MinimumPurchaseForCompany);

    const [limits, setLimits] = useState({
        public: 0,
        vip: 0,
        company: 0
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleLimitsChange = useCallback((newLimits: { public: number; vip: number; company: number }) => {
        setLimits(newLimits);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);
            
            // Update all three options
            await Promise.all([
                updateOption(OptionsEnum.MinimumPurchaseForPublic, limits.public),
                updateOption(OptionsEnum.MinimumPurchaseForVIP, limits.vip),
                updateOption(OptionsEnum.MinimumPurchaseForCompany, limits.company)
            ]);

            // Mutate SWR cache to refresh data
            publicMutate();
            vipMutate();
            companyMutate();

            toast.success('A beállítások sikeresen mentve!');
        } catch (error) {
            console.error('Error saving limits:', error);
            toast.error('Hiba történt a mentés során!');
        } finally {
            setIsSaving(false);
        }
    }, [limits, publicMutate, vipMutate, companyMutate]);

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

            <PurchaseLimitCard 
                publicLimit={publicLimit || 5000} 
                vipLimit={vipLimit || 5000}
                companyLimit={companyLimit || 5000}
                onLimitsChange={handleLimitsChange}
            />

        </DashboardContent>
    );
}