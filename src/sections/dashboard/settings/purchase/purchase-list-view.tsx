"use client"
import { Button } from "@mui/material";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";
import { PurchaseLimitCard } from "./purchase-limit-card";

import { OptionsEnum } from "src/types/option";
import { useGetOption } from "src/actions/options";

export function PurchaseListView() {
    const {option:publicLimit} = useGetOption(OptionsEnum.MinimumPurchaseForPublic);
    const {option:vipLimit} = useGetOption(OptionsEnum.MinimumPurchaseForVIP);
    const {option:companyLimit} = useGetOption(OptionsEnum.MinimumPurchaseForCompany);

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
                    >
                        Módosítások mentése
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <PurchaseLimitCard publicLimit={publicLimit || 0} />

        </DashboardContent>
    );
}