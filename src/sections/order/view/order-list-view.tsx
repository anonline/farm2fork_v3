'use client';

import type { IShipment } from 'src/types/shipments';
import type { IProductItem } from 'src/types/product';
import type { TableHeadCellProps } from 'src/components/table';
import type { IOrderItem, IOrderTableFilters } from 'src/types/order';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fIsAfter, fIsBetween } from 'src/utils/format-time';
import { generateMultiShipmentPDF } from 'src/utils/shipment-pdf-export';
import { generateMultipleShippingLabelsPDF } from 'src/utils/pdf-generator';
import { generateOrderAddressPDF } from 'src/utils/order-address-pdf-export';
import { transformOrdersDataToTableItems } from 'src/utils/transform-order-data';

import { useGetOrders, useGetOrdersCountByStatus } from 'src/actions/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchGetProductsByIds } from 'src/actions/product';
import { useGetPickupLocations } from 'src/actions/pickup-location';
import { useShipments } from 'src/contexts/shipments/shipments-context';
import { deleteOrder, deleteOrders } from 'src/actions/order-management';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
    useTable,
    emptyRows,
    rowInPage,
    TableNoData,
    getComparator,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from 'src/components/table';

import { OrderTableRow } from '../order-table-row';
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from '../order-table-filters-result';

// ----------------------------------------------------------------------

type ShipmentItemSummary = {
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
    isBundleItem?: boolean;
    parentQuantity?: number;
    individualQuantity?: number;
};

const ROLE_OPTIONS = [
    { value: 'public', label: 'Publikus' },
    { value: 'vip', label: 'VIP' },
    { value: 'company', label: 'Cég' },
];

const SHIPPING_METHOD_OPTIONS = [
    { value: 'hazhozszallitas', label: 'Házhozszállítás' },
    { value: 'szemelyes_atvetel', label: 'Személyes átvétel' },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: 'simple', label: 'SimplePay' },
    { value: 'utalas', label: 'Átutalás' },
    { value: 'utanvet', label: 'Utánvét' },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: 'pending', label: 'Nincs fizetve' },
    { value: 'paid', label: 'Foglalva' },
    { value: 'failed', label: 'Sikertelen' },
    { value: 'refunded', label: 'Visszatérítve' },
    { value: 'partially_paid', label: 'Részben fizetve' },
    { value: 'closed', label: 'Lezárva' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Összes' },
    { value: 'pending', label: 'Új rendelés' },
    { value: 'processing', label: 'Feldolgozva' },
    { value: 'shipping', label: 'Szállítás alatt' },
    { value: 'delivered', label: 'Teljesítve' },
    { value: 'cancelled', label: 'Visszamondva' },
    { value: 'refunded', label: 'Visszatérítve' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'orderNumber', label: 'ID', width: 60, sx: { display: { xs: 'none', md: 'table-cell' } } },
    { id: 'status', label: 'Státusz', width: 55 },
    { id: 'name', label: 'Vásárló', width: 280 },
    { id: 'totalQuantity', label: '', width: 55, align: 'center' },
    { id: 'totalAmount', label: 'Összeg', width: 140 },
    { id: 'paymentStatus', label: 'Fizetve', width: 110 },
    { id: 'createdAt', label: 'Dátum', width: 140 },
    { id: 'planned_shipping_date_time', label: 'Szállítás', width: 140, align: 'center' },
    { id: 'delivery', label: 'Szállítási mód', width: 160, align: 'center' },
    { id: 'payment', label: 'Fizetési mód', width: 160 },
    { id: 'invoice', label: 'Számla', width: 120 },
    { id: '', width: 88 },
];

const TABLE_HEAD_MOBILE: TableHeadCellProps[] = [
    { id: 'order', label: 'Rendelés', width: 60 },
    { id: '', width: 0 },
    { id: 'totalnetAmount', label: 'Nettó', width: 140 },
    { id: 'totalAmount', label: 'Bruttó', width: 140 },
    { id: 'planned_shipping_date_time', label: 'Szállítás', width: 140, align: 'center' },
    { id: 'delivery', label: 'Szállítási mód', width: 140 },
    { id: 'payment', label: 'Fizetési mód', width: 160 },
    { id: 'invoice', label: 'Számla', width: 120 },
];

// ----------------------------------------------------------------------

export function OrderListView() {
    const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc', defaultDense: true });
    const { shipments, shipmentsLoading } = useShipments();
    const { locations: pickupLocations } = useGetPickupLocations();
    const confirmDialog = useBoolean();
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [sumOrderGrossValue, setSumOrderGrossValue] = useState(0);

    const filters = useSetState<IOrderTableFilters>({
        name: '',
        status: 'all',
        startDate: null,
        endDate: null,
        shipments: [],
        roles: [],
        shippingMethods: [],
        paymentMethods: [],
        paymentStatuses: [],
    });

    const { state: currentFilters, setState: updateFilters } = filters;

    // Fetch orders from database
    const {
        orders: filteredOrdersData,
        ordersLoading,
        ordersError,
        refreshOrders
    } = useGetOrders({
        status: currentFilters.status !== 'all' ? currentFilters.status : undefined,
    });

    // Fetch all orders for tab counts (without status filter)
    const { orders: allOrdersData } = useGetOrders({});
    const { ordersCountByStatus, refreshOrdersCountByStatus } = useGetOrdersCountByStatus();
    
    // Transform orders data to table format
    const [tableData, setTableData] = useState<IOrderItem[]>([]);

    const transformedShipmentFilterData: { value: string; label: string }[] = shipmentsLoading ? [] : shipments.map((shipment) => ({
        value: shipment.id.toString(),
        label: fDate(shipment.date),
    }));



    useEffect(() => {
        const loadTransformedData = async () => {
            if (filteredOrdersData) {
                const transformedData = await transformOrdersDataToTableItems(filteredOrdersData);
                setTableData(transformedData);
            }
        };

        loadTransformedData();
    }, [filteredOrdersData]);

    // Refresh orders when page regains focus (e.g., returning from detail view)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshOrders();
            }
        };

        const handleFocus = () => {
            refreshOrders();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [refreshOrders]);

    const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: currentFilters,
        dateError,
    });

    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

    // Calculate sum for filtered data
    useEffect(() => {
        setSumOrderGrossValue(dataFiltered.reduce((sum, order) => sum + order.totalAmount, 0));
    }, [dataFiltered, setSumOrderGrossValue]);

    const canReset =
        !!currentFilters.name ||
        currentFilters.status !== 'all' ||
        (!!currentFilters.startDate && !!currentFilters.endDate) ||
        !!currentFilters.shipments.length ||
        !!currentFilters.roles.length ||
        !!currentFilters.shippingMethods.length ||
        !!currentFilters.paymentMethods.length ||
        !!currentFilters.paymentStatuses.length;

    const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

    const handleDeleteRow = useCallback(
        async (id: string) => {
            try {
                const { success, error } = await deleteOrder(id);

                if (success) {
                    toast.success('Rendelés sikeresen törölve!');
                    // Refresh data from server
                    refreshOrders();
                    table.onUpdatePageDeleteRow(dataInPage.length);
                } else {
                    toast.error(error || 'Hiba történt a rendelés törlése során');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                toast.error('Váratlan hiba történt');
            }
        },
        [dataInPage.length, table, refreshOrders]
    );

    const handleDeleteRows = useCallback(async () => {
        try {
            const { success, error } = await deleteOrders(table.selected);

            if (success) {
                toast.success('Rendelések sikeresen törölve!');
                // Refresh data from server
                refreshOrders();
                table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
            } else {
                toast.error(error || 'Hiba történt a rendelések törlése során');
            }
        } catch (error) {
            console.error('Error deleting orders:', error);
            toast.error('Váratlan hiba történt');
        }
    }, [dataFiltered.length, dataInPage.length, table, refreshOrders]);

    const handleFilterStatus = useCallback(
        (event: React.SyntheticEvent, newValue: string) => {
            table.onResetPage();
            updateFilters({ status: newValue });
            refreshOrdersCountByStatus();
        },
        [updateFilters, table]
    );

    const handleGenerateShippingLabels = useCallback(async () => {
        try {
            setPdfGenerating(true);

            // Get selected orders
            const selectedOrders = dataFiltered.filter((order) => table.selected.includes(order.id));

            if (selectedOrders.length === 0) {
                toast.error('Nincsenek kiválasztott rendelések');
                return;
            }

            // Check if orders are still loading
            if (ordersLoading) {
                toast.error('Rendelések betöltése folyamatban, kérjük várjon...');
                return;
            }

            // Notify user about the process
            toast.info(`${selectedOrders.length} rendelés szállítólevelének generálása...`);

            await generateMultipleShippingLabelsPDF(selectedOrders, pickupLocations);
            toast.success(`${selectedOrders.length} rendelés szállítólevele sikeresen generálva és letöltve!`);

        } catch (error) {
            console.error('Error generating shipping labels:', error);
            const errorMessage = error instanceof Error ? error.message : 'Szállítólevelek generálása sikertelen volt';
            toast.error(errorMessage);
        } finally {
            setPdfGenerating(false);
        }
    }, [dataFiltered, table.selected, ordersLoading]);

    const handleExportSummaryPDF = useCallback(async () => {
        try {
            setPdfGenerating(true);

            // Get selected orders
            const selectedOrders = dataFiltered.filter((order) => table.selected.includes(order.id));

            if (selectedOrders.length === 0) {
                toast.error('Nincsenek kiválasztott rendelések');
                return;
            }

            // Check if orders are still loading
            if (ordersLoading) {
                toast.error('Rendelések betöltése folyamatban, kérjük várjon...');
                return;
            }

            // Notify user about the process
            toast.info(`${selectedOrders.length} rendelés összesítésének generálása...`);

            // Get unique product IDs from all order items
            const productIds = Array.from(new Set(
                selectedOrders.flatMap(order => order.items.map(item => item.id).filter(Boolean))
            ));

            // Fetch product data
            let products: IProductItem[] = [];
            if (productIds.length > 0) {
                const productsResult = await fetchGetProductsByIds(productIds);
                if (productsResult.error) {
                    console.warn('Failed to fetch products:', productsResult.error);
                } else {
                    products = productsResult.products;
                }
            }

            // Generate items summary by aggregating all order items
            const itemsMap = new Map<string, {
                totalQuantity: number;
                prices: number[];
                customers: Set<string>;
                orderIds: Set<string>;
                item: any;
                productData?: IProductItem;
            }>();

            selectedOrders.forEach((order) => {
                order.items.forEach((item) => {
                    const key = `${item.name || 'Unknown'}-${item.unit || ''}`;

                    if (!itemsMap.has(key)) {
                        const productData = products.find(p => p.id.toString() === item.id.toString());
                        itemsMap.set(key, {
                            totalQuantity: 0,
                            prices: [],
                            customers: new Set(),
                            orderIds: new Set(),
                            item,
                            productData,
                        });
                    }

                    const summary = itemsMap.get(key)!;
                    summary.totalQuantity += item.quantity;
                    summary.prices.push(item.grossPrice || 0);
                    summary.customers.add(order.customer.name);
                    summary.orderIds.add(order.id);
                });
            });

            // Convert map to summary array - first collect parent items with their bundle items
            const parentItemsWithBundles: Array<{
                parent: ShipmentItemSummary;
                bundleItems: ShipmentItemSummary[];
            }> = [];

            itemsMap.forEach((data, key) => {
                const averagePrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;
                const baseItem: ShipmentItemSummary = {
                    id: key,
                    name: data.item.name || 'Unknown',
                    unit: data.item.unit || 'db',
                    totalQuantity: data.totalQuantity,
                    averagePrice,
                    totalValue: data.totalQuantity * averagePrice,
                    orderCount: data.orderIds.size,
                    customersCount: data.customers.size,
                    customers: Array.from(data.customers),
                    productId: data.item.id,
                    isBio: data.productData?.bio || false,
                };

                const bundleItems: ShipmentItemSummary[] = [];

                // If it's a bundle product, collect its bundle items
                if (data.productData?.type === 'bundle' && data.productData?.bundleItems && data.productData.bundleItems.length > 0) {
                    data.productData.bundleItems.forEach((bundleItem) => {
                        const totalBundleQuantity = bundleItem.qty * data.totalQuantity;
                        bundleItems.push({
                            id: `${key}-bundle-${bundleItem.productId}`,
                            name: bundleItem.product?.name || 'Unknown',
                            unit: bundleItem.product?.unit || 'db',
                            totalQuantity: totalBundleQuantity,
                            averagePrice: 0,
                            totalValue: 0,
                            orderCount: data.orderIds.size,
                            customersCount: data.customers.size,
                            customers: Array.from(data.customers),
                            productId: bundleItem.productId,
                            isBio: bundleItem.product?.bio || false,
                            isBundleItem: true,
                            parentQuantity: data.totalQuantity,
                            individualQuantity: bundleItem.qty,
                        });
                    });
                }

                parentItemsWithBundles.push({ parent: baseItem, bundleItems });
            });

            // Sort parent items by total value
            parentItemsWithBundles.sort((a, b) => b.parent.totalValue - a.parent.totalValue);

            // Flatten the array: parent followed by its bundle items
            const itemsSummary: ShipmentItemSummary[] = [];
            parentItemsWithBundles.forEach(({ parent, bundleItems }) => {
                itemsSummary.push(parent);
                itemsSummary.push(...bundleItems);
            });

            // Create a mock shipment object
            const orderNumbers = selectedOrders
                .map(order => order.orderNumber)
                .filter(Boolean)
                .join(', ');

            const mockShipment: IShipment = {
                id: 0,
                date: orderNumbers || 'Rendelések összesítője',
                orderCount: selectedOrders.length,
                productCount: itemsSummary.filter(item => !item.isBundleItem).length,
                productAmount: selectedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
                updatedAt: new Date(),
            };

            const summarizedData = {
                shipment: mockShipment,
                itemsSummary,
            };

            await generateMultiShipmentPDF([summarizedData]);
            toast.success(`${selectedOrders.length} rendelés összesítése sikeresen generálva!`);

        } catch (error) {
            console.error('Error generating summary PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Összesítő PDF generálása sikertelen volt';
            toast.error(errorMessage);
        } finally {
            setPdfGenerating(false);
        }
    }, [dataFiltered, table.selected, ordersLoading]);

    const handleExportAddressList = useCallback(async () => {
        try {
            if (table.selected.length === 0) {
                toast.warning('Kérlek válassz legalább egy rendelést!');
                return;
            }

            // Check if orders are still loading
            if (ordersLoading || !filteredOrdersData) {
                toast.error('Rendelések betöltése folyamatban, kérjük várjon...');
                return;
            }

            // Get selected orders from the original ordersData (IOrderData[])
            const selectedOrders = filteredOrdersData.filter((order) => table.selected.includes(order.id));

            if (selectedOrders.length === 0) {
                toast.warning('A kiválasztott rendelések nem találhatók!');
                return;
            }

            // Generate title/subtitle
            const title = 'Szállítási címlista';
            const subtitle = `${selectedOrders.length} rendelés`;

            // Generate address list PDF
            await generateOrderAddressPDF(selectedOrders, title, subtitle);
            toast.success('Címlista PDF export sikeresen elkészült!');

        } catch (error) {
            console.error('Address list export error:', error);
            toast.error('Hiba a címlista exportálása során!');
        }
    }, [filteredOrdersData, table.selected, ordersLoading]);



    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content={
                <>
                    Biztosan törölni akarja a kijelölt <strong> {table.selected.length} </strong> elemet?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRows();
                        confirmDialog.onFalse();
                    }}
                >
                    Törlés
                </Button>
            }
        />
    );

    return (
        <>
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Összes rendelés (max. 1000 rendelés)"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Rendelések', href: paths.dashboard.order.root },
                        { name: 'Lista' },
                    ]}
                    action={
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Label color="default" variant="inverted">
                                Összesen br. {fCurrency(sumOrderGrossValue)}
                            </Label>
                            <Button
                                component={RouterLink}
                                href={paths.dashboard.order.new}
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                            >
                                Új rendelés
                            </Button>
                        </Box>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                {ordersLoading && <LoadingScreen />}

                {ordersError && !ordersLoading && (
                    <Card sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="error">
                            Hiba történt a rendelések betöltése során
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                            {ordersError}
                        </Typography>
                        <Button variant="contained" onClick={() => refreshOrders()}>
                            Újrapróbálás
                        </Button>
                    </Card>
                )}

                {!ordersLoading && !ordersError && (
                    <Card>
                        <Tabs
                            value={currentFilters.status}
                            onChange={handleFilterStatus}
                            sx={[
                                (theme) => ({
                                    px: 2.5,
                                    boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                                }),
                            ]}
                        >
                            {STATUS_OPTIONS.map((tab) => (
                                <Tab
                                    key={tab.value}
                                    iconPosition="end"
                                    value={tab.value}
                                    label={tab.label}
                                    icon={
                                        <Label
                                            variant={
                                                ((tab.value === 'all' ||
                                                    tab.value === currentFilters.status) &&
                                                    'filled') ||
                                                'soft'
                                            }
                                            color={
                                                (tab.value === 'delivered' && 'success') ||
                                                (tab.value === 'pending' && 'warning') ||
                                                (tab.value === 'processing' && 'info') ||
                                                (tab.value === 'cancelled' && 'error') ||
                                                (tab.value === 'refunded' && 'error') ||
                                                'default'
                                            }
                                        >
                                            {[
                                                'delivered',
                                                'pending',
                                                'cancelled',
                                                'refunded',
                                                'shipping',
                                                'processing',
                                                'deleted',
                                            ].includes(tab.value)
                                                ? ordersCountByStatus[tab.value] || 0
                                                : allOrdersData.length}
                                        </Label>
                                    }
                                />
                            ))}
                        </Tabs>

                        <OrderTableToolbar
                            filters={filters}
                            onResetPage={table.onResetPage}
                            dateError={dateError}
                            options={{
                                shipments: transformedShipmentFilterData,
                                roles: ROLE_OPTIONS,
                                shippingMethods: SHIPPING_METHOD_OPTIONS,
                                paymentMethods: PAYMENT_METHOD_OPTIONS,
                                paymentStatuses: PAYMENT_STATUS_OPTIONS,
                            }}
                        />

                        {canReset && (
                            <OrderTableFiltersResult
                                filters={filters}
                                totalResults={dataFiltered.length}
                                onResetPage={table.onResetPage}
                                sx={{ p: 2.5, pt: 0 }}
                                shipments={transformedShipmentFilterData}
                                roles={ROLE_OPTIONS}
                                shippingMethods={SHIPPING_METHOD_OPTIONS}
                                paymentMethods={PAYMENT_METHOD_OPTIONS}
                                paymentStatuses={PAYMENT_STATUS_OPTIONS}
                                statuses={STATUS_OPTIONS}
                            />
                        )}

                        <Box sx={{ position: 'relative' }}>
                            <TableSelectedAction
                                dense={table.dense}
                                numSelected={table.selected.length}
                                rowCount={dataFiltered.length}
                                onSelectAllRows={(checked) =>
                                    table.onSelectAllRows(
                                        checked,
                                        dataFiltered.map((row) => row.id)
                                    )
                                }
                                action={
                                    <>
                                        <Label color="default" variant="filled" sx={{ mr: 2 }}>
                                            Nettó: {fCurrency(dataFiltered
                                                .filter((order) => table.selected.includes(order.id))
                                                .reduce((sum, order) => sum + (order.totalAmount - order.taxes), 0)
                                            )}
                                        </Label>
                                        <Label color="info" variant="filled" sx={{ mr: 2 }}>
                                            Bruttó: {fCurrency(dataFiltered
                                                .filter((order) => table.selected.includes(order.id))
                                                .reduce((sum, order) => sum + order.totalAmount, 0)
                                            )}
                                        </Label>
                                        <Tooltip title="Címlista exportálása">
                                            <IconButton
                                                color="primary"
                                                onClick={handleExportAddressList}
                                                disabled={table.selected.length === 0}
                                            >
                                                <Iconify icon="mingcute:pdf-fill" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={pdfGenerating ? "PDF generálása..." : "Összesítő PDF nyomtatása"}>
                                            <IconButton
                                                color="primary"
                                                onClick={handleExportSummaryPDF}
                                                disabled={pdfGenerating || table.selected.length === 0}
                                            >
                                                <Iconify icon="solar:printer-minimalistic-bold" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={pdfGenerating ? "PDF generálása..." : "Szállítólevél nyomtatása"}>
                                            <IconButton
                                                color="primary"
                                                onClick={handleGenerateShippingLabels}
                                                disabled={pdfGenerating || table.selected.length === 0}
                                            >
                                                <Iconify icon="solar:file-text-bold" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Törlés" sx={{ ml: { md: 3 } }}>
                                            <IconButton color="error" onClick={confirmDialog.onTrue}>
                                                <Iconify icon="solar:trash-bin-trash-bold" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                            />

                            <Scrollbar sx={{ minHeight: 444 }}>
                                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: { xs: '100%', md: 960 } }}>
                                    {/* Desktop table header - only render on md and up */}
                                    {(() => {
                                        const isDesktop = window.innerWidth >= 960; // md breakpoint
                                        return isDesktop ? (
                                            <TableHeadCustom
                                                order={table.order}
                                                orderBy={table.orderBy}
                                                headCells={TABLE_HEAD}
                                                rowCount={dataFiltered.length}
                                                numSelected={table.selected.length}
                                                onSort={table.onSort}
                                                onSelectAllRows={(checked) =>
                                                    table.onSelectAllRows(
                                                        checked,
                                                        dataFiltered.map((row) => row.id)
                                                    )
                                                }
                                            />
                                        ) : (
                                            <TableHeadCustom
                                                order={table.order}
                                                orderBy={table.orderBy}
                                                headCells={TABLE_HEAD_MOBILE}
                                                rowCount={dataFiltered.length}
                                                numSelected={table.selected.length}
                                                onSort={table.onSort}
                                                onSelectAllRows={(checked) =>
                                                    table.onSelectAllRows(
                                                        checked,
                                                        dataFiltered.map((row) => row.id)
                                                    )
                                                }
                                            />
                                        );
                                    })()}

                                    <TableBody>
                                        {dataFiltered
                                            .slice(
                                                table.page * table.rowsPerPage,
                                                table.page * table.rowsPerPage + table.rowsPerPage
                                            )
                                            .map((row) => (
                                                <OrderTableRow
                                                    key={row.id}
                                                    row={row}
                                                    selected={table.selected.includes(row.id)}
                                                    onSelectRow={() => table.onSelectRow(row.id)}
                                                    onDeleteRow={() => handleDeleteRow(row.id)}
                                                    detailsHref={paths.dashboard.order.details(row.id)}
                                                />
                                            ))}

                                        <TableEmptyRows
                                            height={table.dense ? 56 : 56 + 20}
                                            emptyRows={emptyRows(
                                                table.page,
                                                table.rowsPerPage,
                                                dataFiltered.length
                                            )}
                                        />

                                        <TableNoData notFound={notFound} />
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </Box>

                        <TablePaginationCustom
                            page={table.page}
                            dense={table.dense}
                            count={dataFiltered.length}
                            rowsPerPage={table.rowsPerPage}
                            rowsPerPageOptions={[25, 50, 100, 200]}
                            onPageChange={table.onChangePage}
                            onChangeDense={table.onChangeDense}
                            onRowsPerPageChange={table.onChangeRowsPerPage}
                        />
                    </Card>
                )}
            </DashboardContent>

            {renderConfirmDialog()}
        </>
    );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
    dateError: boolean;
    inputData: IOrderItem[];
    filters: IOrderTableFilters;
    comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
    const { status, name, startDate, endDate, shipments, roles, shippingMethods, paymentMethods, paymentStatuses } = filters;

    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (name) {
        inputData = inputData.filter(({ orderNumber, customer }) =>
            [orderNumber, customer.name, customer.email].some((field) =>
                field && String(field).toLowerCase().includes(name.toLowerCase())
            )
        );
    }

    if (roles.length > 0) {
        inputData = inputData.filter((order) => {
            if (order.customer.userType) {
                return roles.includes(order.customer.userType);
            }
            return false;
        });
    }

    if (shipments.length > 0) {
        inputData = inputData.filter((order) => {
            if (order.shipmentId) {
                return shipments.includes(order.shipmentId.toString());
            }
            return false;
        });
    }

    if (shippingMethods.length > 0) {
        inputData = inputData.filter((order) => {
            switch (order.delivery.shipBy) {
                case 'Házhozszállítás':
                    return shippingMethods.includes('hazhozszallitas');
                case 'Személyes átvétel':
                    return shippingMethods.includes('szemelyes_atvetel');
                default:
                    return false;
            }
        });
    }

    if (paymentMethods.length > 0) {
        inputData = inputData.filter((order) => {
            switch (order.payment.cardType) {
                case 'SimplePay fizetés':
                    return paymentMethods.includes('simple');
                case 'Átutalás':
                    return paymentMethods.includes('utalas');
                case 'Utánvét':
                    return paymentMethods.includes('utanvet');
                default:
                    return false;
            }
        });
    }

    if (paymentStatuses.length > 0) {
        inputData = inputData.filter((order) => {
            if (order.payment.status) {
                return paymentStatuses.includes(order.payment.status);
            }
            return false;
        });
    }

    if (status !== 'all') {
        inputData = inputData.filter((order) => order.status === status);
    }

    if (!dateError) {
        if (startDate && endDate) {
            inputData = inputData.filter((order) =>
                fIsBetween(order.createdAt, startDate, endDate)
            );
        }
    }

    return inputData;
}
