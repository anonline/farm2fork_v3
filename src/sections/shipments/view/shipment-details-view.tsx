'use client';

import type { IShipment } from 'src/types/shipments';
import type { IProductItem } from 'src/types/product';
import type { IOrderData, IOrderItem } from 'src/types/order-management';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { generateShipmentPDF } from 'src/utils/shipment-pdf-export';
import { generateShipmentXLS } from 'src/utils/shipment-xls-export';
import { generateOrderAddressPDF } from 'src/utils/order-address-pdf-export';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchGetProductsByIds } from 'src/actions/product';
import { getOrdersByShipmentId } from 'src/actions/order-management';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ShipmentItemsTable } from '../components';
import { OrdersTable } from '../new-shipment-orders-table';

// ----------------------------------------------------------------------

type Props = {
    id: number;
};

export type ShipmentItemSummary = {
    id: string;
    name: string;
    size?: string;
    unit?: string;
    totalQuantity: number;
    averagePrice: number;
    totalValue: number;
    orderCount: number;
    customersCount: number;
    customers: string[];
    productId?: string;
    isBio?: boolean;
    productData?: IProductItem;
    productLink?: string | null;
    isBundleItem?: boolean;
    parentQuantity?: number;
    individualQuantity?: number;
};

export function ShipmentDetailsView({ id }: Readonly<Props>) {
    const theme = useTheme();
    const { shipments, shipmentsLoading, refreshCounts, shipmentsMutate } = useShipments();

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<IOrderData[]>([]);
    const [products, setProducts] = useState<IProductItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const shipment = useMemo(() =>
        shipments.find((s: IShipment) => s.id === Number(id)),
        [shipments, id]
    );

    const fetchOrdersData = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await getOrdersByShipmentId(id);

            if (result.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                setOrders(result.orders);

                // Extract unique product IDs from order items
                const productIds = Array.from(
                    new Set(
                        result.orders
                            .flatMap(order => order.items)
                            .map(item => item.id.toString())
                            .filter((oid): oid is string => typeof oid === 'string')
                    )
                );

                // Fetch product data if we have product IDs
                if (productIds.length > 0) {
                    const productsResult = await fetchGetProductsByIds(productIds);
                    if (productsResult.error) {
                        console.error('Error fetching products:', productsResult.error);
                    } else {
                        setProducts(productsResult.products);
                    }
                }
                
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Hiba történt az adatok betöltésekor';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // Only fetch orders if we have a valid shipment or shipments are still loading
        if (shipment || shipmentsLoading) {
            fetchOrdersData();
        } else if (!shipmentsLoading && !shipment) {
            // If shipments finished loading but no shipment found, set loading to false
            setLoading(false);
        }
    }, [fetchOrdersData, shipment, shipmentsLoading]);

    const itemsSummary = useMemo((): ShipmentItemSummary[] => {
        const itemsMap = new Map<string, {
            item: IOrderItem;
            quantities: number[];
            prices: number[];
            customers: Set<string>;
            orderIds: Set<string>;
        }>();

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const key = `${item.name}-${item.size || ''}-${item.unit || ''}`;

                if (!itemsMap.has(key)) {
                    itemsMap.set(key, {
                        item,
                        quantities: [],
                        prices: [],
                        customers: new Set(),
                        orderIds: new Set(),
                    });
                }

                const summary = itemsMap.get(key)!;
                summary.quantities.push(item.quantity);
                summary.prices.push(item.grossPrice);
                summary.customers.add(order.customerName);
                summary.orderIds.add(order.id);
            });
        });
        
        const summaryItems = Array.from(itemsMap.entries()).map(([key, data]) => {
            const totalQuantity = data.quantities.reduce((sum, qty) => sum + qty, 0);
            const averagePrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;

            // Find corresponding product data
            const productData = products.find(product => product.id.toString() === data.item.id.toString());
            
            return {
                id: key,
                name: data.item.name,
                size: data.item.size,
                unit: data.item.unit,
                totalQuantity,
                averagePrice,
                totalValue: totalQuantity * averagePrice,
                orderCount: data.orderIds.size,
                customersCount: data.customers.size,
                customers: Array.from(data.customers),
                productId: data.item.id,
                isBio: productData?.bio || false,
                productLink: data.item.slug ? paths.dashboard.product.edit(data.item.slug) : null,
                productData,
            };
        }).sort((a, b) => b.totalValue - a.totalValue);

        // Expand bundle items
        const expandedItems: ShipmentItemSummary[] = [];
        summaryItems.forEach((item) => {
            // Add the main product
            expandedItems.push(item);

            // If it's a bundle product, add its bundle items
            if (item.productData?.type === 'bundle' && item.productData?.bundleItems && item.productData.bundleItems.length > 0) {
                console.log('Expanding bundle items for', item.productData.bundleItems);
                item.productData.bundleItems.forEach((bundleItem) => {
                    const totalBundleQuantity = bundleItem.qty * item.totalQuantity;
                    expandedItems.push({
                        id: `${item.id}-bundle-${bundleItem.productId}`,
                        name: bundleItem.product?.name || 'Unknown',
                        unit: bundleItem.product?.unit || 'db',
                        totalQuantity: totalBundleQuantity,
                        averagePrice: 0,
                        totalValue: 0,
                        orderCount: item.orderCount,
                        customersCount: item.customersCount,
                        customers: item.customers,
                        productId: bundleItem.productId,
                        isBio: bundleItem.product?.bio || false,
                        productLink: bundleItem.product?.url ? paths.dashboard.product.edit(bundleItem.product.url) : null,
                        productData: bundleItem.product,
                        isBundleItem: true,
                        parentQuantity: item.totalQuantity,
                        individualQuantity: bundleItem.qty,
                    });
                });
            }
        });

        return expandedItems;
    }, [orders, products]);

    const handleExportPDF = useCallback(async () => {
        if (!shipment) return;

        try {
            await generateShipmentPDF(shipment, itemsSummary);
            toast.success('PDF export sikeresen elkészült!');
        } catch (err) {
            console.error('PDF export error:', err);
            toast.error('Hiba a PDF exportálása során');
        }
    }, [shipment, itemsSummary]);

    const handleExportXLS = useCallback(async () => {
        if (!shipment) return;

        try {
            generateShipmentXLS(shipment, itemsSummary);
            toast.success('XLS export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az XLS exportálása során');
        }
    }, [shipment, itemsSummary]);

    const handleExportAddressList = useCallback(async () => {
        if (!shipment || orders.length === 0) return;

        try {
            const shipmentDate = shipment.date ? new Date(shipment.date).toLocaleDateString('hu-HU') : `#${shipment.id}`;
            const title = 'Szállítási címlista';
            const subtitle = `Szállítás: ${shipmentDate}`;

            await generateOrderAddressPDF(orders, title, subtitle);
            toast.success('Címlista PDF export sikeresen elkészült!');
        } catch (err) {
            console.error('Address list export error:', err);
            toast.error('Hiba a címlista exportálása során');
        }
    }, [shipment, orders]);

    const handleRefreshCounts = useCallback(async () => {
        if (!shipment) return;

        try {
            setLoading(true);
            await refreshCounts(shipment.id);
            await shipmentsMutate();
            toast.success('Szállítási összesítő adatok frissítve');
        } catch (err) {
            console.error('Error refreshing counts:', err);
            toast.error('Hiba történt a frissítés során');
        } finally {
            setLoading(false);
        }
    }, [shipment, refreshCounts, shipmentsMutate]);

    const handleOrderRowClick = useCallback((orderId: string) => {
        window.open(paths.dashboard.order.details(orderId), '_blank');
    }, []);

    // Show loading state while shipments are being fetched
    if (shipmentsLoading) {
        return (
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Szállítási összesítő részletei"
                    links={[
                        { name: 'Dashboard', href: '/dashboard' },
                        { name: 'Szállítási összesítők', href: '/dashboard/shipments' },
                        { name: `#${id}` },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                        Betöltés...
                    </Typography>
                </Box>
            </DashboardContent>
        );
    }

    // Show error state if shipment not found after loading is complete
    if (!shipmentsLoading && !shipment) {
        return (
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Szállítási összesítő részletei"
                    links={[
                        { name: 'Dashboard', href: '/dashboard' },
                        { name: 'Szállítási összesítők', href: '/dashboard/shipments' },
                        { name: `#${id}` },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <Typography variant="h4" color="error">
                        Szállítási összesítő nem található (ID: {id})
                    </Typography>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading={`Szállítási összesítő részletei  - ${shipment?.date ? new Date(shipment.date).toLocaleDateString('hu-HU') : shipment?.id}`}
                links={[
                    { name: 'Dashboard', href: '/dashboard' },
                    { name: 'Szállítási összesítő', href: '/dashboard/shipments' },
                    { name: `${shipment?.date ? new Date(shipment.date).toLocaleDateString('hu-HU') : shipment?.id}` },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Stack spacing={3}>
                {/* Shipment Overview Card */}
                <Card>
                    <CardHeader
                        title="Összesítő információk"
                    />
                    <Box sx={{ p: 3, pt: 3 }}>
                        <Stack direction="row" spacing={3} justifyContent="space-between" flexWrap="wrap">
                            <Stack spacing={1} sx={{ minWidth: 120 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Termékek száma
                                </Typography>
                                <Typography variant="h4">
                                    {shipment?.productCount}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} sx={{ minWidth: 120 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Rendelések száma
                                </Typography>
                                <Typography variant="h4">
                                    {shipment?.orderCount}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} sx={{ minWidth: 120 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Feldolgozottság ({((orders.filter(o => o.shipmentId === shipment?.id && o.orderStatus == 'processing').length / (shipment?.orderCount || 1)) * 100).toFixed(1)}%)
                                </Typography>
                                <Typography variant="h4">
                                    {orders.filter(o => o.shipmentId === shipment?.id && o.orderStatus == 'processing').length}/{shipment?.orderCount ?? 0}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} sx={{ minWidth: 120 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Összérték
                                </Typography>
                                <Typography variant="h4">
                                    {new Intl.NumberFormat('hu-HU', {
                                        style: 'currency',
                                        currency: 'HUF',
                                        maximumFractionDigits: 0,
                                    }).format(shipment?.productAmount ?? 0)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>

                {/* Items Table Card */}
                <Card>
                    <CardHeader
                        title="Termékek összesítése"
                        subheader={`${itemsSummary.length} fajta termék`}
                        sx={{
                            pb: 2,
                            gap: 2,
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            '& .MuiCardHeader-content': {
                                width: { xs: '100%', sm: 'auto' }
                            },
                            '& .MuiCardHeader-action': {
                                width: { xs: '100%', sm: 'auto' },
                                textAlign: { xs: 'right', sm: 'inherit' }
                            }
                        }}
                        action={
                            <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    startIcon={<Iconify icon="mingcute:pdf-fill" />}
                                    onClick={handleExportAddressList}
                                    disabled={!shipment || loading || orders.length === 0}
                                    sx={{
                                        bgcolor: alpha(theme.palette.warning.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                                        color: 'warning.main',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.warning.main, 0.16),
                                        },
                                    }}
                                >
                                    Címlista
                                </Button>
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:download-bold" />}
                                    onClick={handleExportPDF}
                                    disabled={!shipment || loading}
                                    sx={{
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.24)}`,
                                        color: 'error.main',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.error.main, 0.16),
                                        },
                                    }}
                                >
                                    PDF
                                </Button>
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:download-bold" />}
                                    onClick={handleExportXLS}
                                    disabled={!shipment || loading}
                                    sx={{
                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
                                        color: 'success.main',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.success.main, 0.16),
                                        },
                                    }}
                                >
                                    XLS
                                </Button>
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:restart-bold" />}
                                    onClick={handleRefreshCounts}
                                    disabled={!shipment || loading}
                                    sx={{
                                        bgcolor: alpha(theme.palette.info.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
                                        color: 'info.main',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.info.main, 0.16),
                                        },
                                    }}
                                >
                                    Frissítés
                                </Button>
                            </Stack>
                        }
                    />

                    <ShipmentItemsTable
                        data={itemsSummary}
                        loading={loading}
                        error={error}
                    />

                    
                </Card>

                <Card>
                    <OrdersTable orders={orders} selectedOrders={[]} onOrderToggle={handleOrderRowClick} hideCheckboxes />
                </Card>
            </Stack>
        </DashboardContent>
    );
}