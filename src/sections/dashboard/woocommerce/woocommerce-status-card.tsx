'use client';

import Link from "next/link";

import { Card, Grid, Alert, Stack, Typography, CardContent, CircularProgress } from "@mui/material";

import { themeConfig } from "src/theme";
import { useGetProducts } from "src/actions/product";
import { useGetProducers } from "src/actions/producer";
import { useGetCategories } from "src/actions/category";

import { Iconify } from "src/components/iconify";

type Props = {
    status: any;
    wooProducts: any[];
    wooCategories?: any[];
    wooProducers?: any[];
};

export default function WooImportStatusPage({ status, wooProducts, wooCategories, wooProducers }: Props) {
    const { products, productsLoading } = useGetProducts();
    const { categories, categoriesLoading } = useGetCategories();
    const { producers, producersLoading } = useGetProducers();
    
    return (
        <Stack spacing={3}>
            {status !== null && (
                <Alert severity="success">
                    WooCommerce kapcsolat elérhető. Woocommerce {status.environment.version} Wordpress {status.environment.wp_version} <Link href={status.environment.home_url} target="_blank" rel="noopener">{status.environment.home_url}</Link>
                </Alert>
            )}
            {status === null && (
                <Alert severity="error">
                    WooCommerce kapcsolat nem elérhető.
                </Alert>
            )}

            <Card >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 5.8 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5" gutterBottom>
                                    Rendszer státusz
                                </Typography>

                                {productsLoading ? (
                                    <div>Loading products...</div>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography>Összes termék:</Typography>
                                        <Typography>{products?.length || 0}</Typography>
                                    </Stack>
                                )}

                                {categoriesLoading ? (
                                    <div>Loading categories...</div>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography>Összes termék kategória:</Typography>
                                        <Typography>{categories?.length || 0}</Typography>
                                    </Stack>
                                )}
                                {producersLoading ? (
                                    <div>Loading producers...</div>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                        <Typography>Összes termelő:</Typography>
                                        <Typography>{producers?.length || 0}</Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 0.4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Stack spacing={2} alignItems="center"  sx={{ height: '100%' }}>
                                <Typography variant="h5" >
                                    <Iconify icon="solar:transfer-horizontal-bold-duotone" width={24} height={24} />
                                </Typography>
                                <Stack spacing={2}>
                                    {productsLoading
                                        ? (<CircularProgress size={24} />)
                                        : products.length !== wooProducts.length
                                            ? (<Iconify icon="solar:close-circle-bold" width={24} height={24} color={themeConfig.palette.error.main} />)
                                            : (<Iconify icon="solar:check-circle-bold" width={24} height={24} color={themeConfig.palette.success.main} />)
                                    }
                                    {categoriesLoading
                                        ? (<CircularProgress size={24} />)
                                        : categories.length !== wooCategories?.length
                                            ? (<Iconify icon="solar:close-circle-bold" width={24} height={24} color={themeConfig.palette.error.main} />)
                                            : (<Iconify icon="solar:check-circle-bold" width={24} height={24} color={themeConfig.palette.success.main} />)
                                    }
                                    {producersLoading
                                        ? (<CircularProgress size={24} />)
                                        : producers.length !== wooProducers?.length
                                            ? (<Iconify icon="solar:close-circle-bold" width={24} height={24} color={themeConfig.palette.error.main} />)
                                            : (<Iconify icon="solar:check-circle-bold" width={24} height={24} color={themeConfig.palette.success.main} />)
                                    }
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5.8 }}>
                            <Stack spacing={2}>
                                <Typography variant="h5" gutterBottom>
                                    Woocommerce státusz
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Typography>Összes termék:</Typography>
                                    <Typography>{wooProducts?.length || 0}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Typography>Összes termék kategória:</Typography>
                                    <Typography>{wooCategories?.length || 0}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Typography>Összes termelő:</Typography>
                                    <Typography>{wooProducers?.length || 0}</Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
}