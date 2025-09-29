'use client';

import type { IProductItem } from 'src/types/product';
import type { Theme, SxProps } from '@mui/material/styles';
import type { IOrderItem } from 'src/types/order-management';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IShipment, IShipmentsTableFilters } from 'src/types/shipments';
import type {
    GridColDef,
    GridSlotProps,
    GridRowSelectionModel,
    GridActionsCellItemProps,
    GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
    DataGrid,
    gridClasses,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { generateMultiShipmentPDF } from 'src/utils/shipment-pdf-export';
import { generateMultiSheetShipmentXLS } from 'src/utils/shipment-xls-export';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchGetProductsByIds } from 'src/actions/product';
import { getOrdersByShipmentId } from 'src/actions/order-management';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { NewShipmentModal } from '../new-shipment-modal';
import { ShipmentsTableToolbar } from '../shipments-table-toolbar';
import { ShipmentsTableFiltersResult } from '../shipments-table-filters-result';
import {
    RenderCellDate,
    RenderCellUpdatedAt,
    RenderCellOrderCount,
    RenderCellProductCount,
    RenderCellProductAmount,
} from '../shipments-table-row';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

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
};

/**
 * Fetch and generate itemsSummary for a single shipment
 */
async function fetchShipmentItemsSummary(shipmentId: number): Promise<ShipmentItemSummary[]> {
    const ordersResult = await getOrdersByShipmentId(shipmentId);

    if (ordersResult.error || !ordersResult.orders) {
        throw new Error(ordersResult.error || 'Failed to fetch orders');
    }

    const orders = ordersResult.orders;

    // Get unique product IDs
    const productIds = Array.from(new Set(
        orders.flatMap(order => order.items.map(item => item.id))
    )).filter(Boolean);

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

    // Generate items summary
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

    return Array.from(itemsMap.entries()).map(([key, data]) => {
        const totalQuantity = data.quantities.reduce((sum, qty) => sum + qty, 0);
        const averagePrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;

        // Find corresponding product data
        const productData = products.find(product => product.id === data.item.id);

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
        };
    }).sort((a, b) => b.totalValue - a.totalValue);
}

// ----------------------------------------------------------------------

export function ShipmentsListView() {
    const confirmDialog = useBoolean();
    const newShipmentModal = useBoolean();

    const { shipments, shipmentsLoading, shipmentsMutate, deleteShipment, refreshCounts } = useShipments();

    const [tableData, setTableData] = useState<IShipment[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
    const [deleteInfo, setDeleteInfo] = useState<{
        shipmentId: number;
        orderCount: number;
        type: 'single' | 'batch';
    } | null>(null);

    const filters = useSetState<IShipmentsTableFilters>({});
    const { state: currentFilters } = filters;

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

    useEffect(() => {
        setTableData(shipments);
    }, [shipments]);

    const canReset = false; // No filters implemented yet

    const dataFiltered = useMemo(() =>
        applyFilter({
            inputData: tableData,
            filters: currentFilters,
        }), [tableData, currentFilters]
    );

    const handleDeleteRowClick = useCallback(
        async (id: number) => {
            try {
                // First check how many orders are associated
                const ordersResult = await getOrdersByShipmentId(id);
                const orderCount = ordersResult.error ? 0 : (ordersResult.orders?.length || 0);

                setDeleteInfo({
                    shipmentId: id,
                    orderCount,
                    type: 'single'
                });
                refreshCounts(id);
                confirmDialog.onTrue();
            } catch (error) {
                console.error('Error checking orders for shipment:', error);
                toast.error('Hiba történt a rendelések ellenőrzése során');
            }
        },
        [confirmDialog.onTrue, refreshCounts]
    );

    const handleDeleteRowsClick = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }

        try {
            // Check orders for all selected shipments
            let totalOrderCount = 0;
            for (const id of selectedRowIds) {
                const ordersResult = await getOrdersByShipmentId(Number(id));
                if (!ordersResult.error && ordersResult.orders) {
                    totalOrderCount += ordersResult.orders.length;
                }

                refreshCounts(Number(id));
            }

            setDeleteInfo({
                shipmentId: 0, // Not used for batch delete
                orderCount: totalOrderCount,
                type: 'batch'
            });

            confirmDialog.onTrue();
        } catch (error) {
            console.error('Error checking orders for shipments:', error);
            toast.error('Hiba történt a rendelések ellenőrzése során');
        }
    }, [selectedRowIds, confirmDialog.onTrue, refreshCounts]);

    const handleDeleteRow = useCallback(
        async (id: number) => {
            try {
                const result = await deleteShipment(id);

                if (result.success) {
                    toast.success('Szállítási összesítő sikeresen törölve!');
                } else {
                    toast.error(result.error || 'A törlés sikertelen!');
                }
            } catch (error) {
                console.error(error);
                toast.error('A törlés sikertelen!');
            }
        },
        [deleteShipment]
    );

    const handleDeleteRows = useCallback(async () => {
        try {
            const results = await Promise.all(
                selectedRowIds.map((id) => deleteShipment(Number(id)))
            );

            const failedDeletions = results.filter(result => !result.success);

            if (failedDeletions.length === 0) {
                toast.success('Minden szállítási összesítő sikeresen törölve!');
                setSelectedRowIds([]);
            } else if (failedDeletions.length === results.length) {
                toast.error('Egyetlen szállítási összesítő sem törölhető - rendelések vannak hozzájuk rendelve!');
            } else {
                toast.warning(`${results.length - failedDeletions.length} összesítő törölve, ${failedDeletions.length} nem törölhető rendelések miatt.`);
                setSelectedRowIds([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('A tömeges törlés sikertelen!');
        }
    }, [selectedRowIds, deleteShipment]);

    const collectShipmentsDataForPdf = async (tableDataforPdf: IShipment[]) => {
        const selectedShipments = tableDataforPdf.filter(shipment =>
            selectedRowIds.includes(shipment.id)
        );

        // Fetch data for each shipment
        const shipmentsData = await Promise.all(
            selectedShipments.map(async (shipment) => {
                try {
                    const itemsSummary = await fetchShipmentItemsSummary(shipment.id);
                    return { shipment, itemsSummary };
                } catch (error) {
                    console.error(`Error fetching data for shipment ${shipment.id}:`, error);
                    // Return empty itemsSummary if there's an error
                    return { shipment, itemsSummary: [] };
                }
            })
        );

        return shipmentsData;
    };

    const collectSummarizedShipmentDataForPdf = async (tableDataForSummarizedPdf: IShipment[]) => {
        const shipmentsData = await collectShipmentsDataForPdf(tableDataForSummarizedPdf);
        const summarizedShipmentData = shipmentsData.reduce((acc, { shipment, itemsSummary }) => {
            // Merge itemsSummary into acc
            itemsSummary.forEach(item => {
                const existingItem = acc.itemsSummary.find(i => i.id === item.id);
                if (existingItem) {
                    // Update existing item
                    existingItem.totalQuantity += item.totalQuantity;
                    existingItem.totalValue += item.totalValue;
                    existingItem.orderCount += item.orderCount;
                    existingItem.customersCount += item.customersCount;
                    existingItem.customers = Array.from(new Set([...existingItem.customers, ...item.customers]));
                } else {
                    // Add new item
                    acc.itemsSummary.push({ ...item });
                }
            });

            // Update shipment-level data
            acc.shipment.orderCount += shipment.orderCount;
            acc.shipment.productCount = itemsSummary.length;
            acc.shipment.productAmount += shipment.productAmount;

            acc.shipment.date += (typeof acc.shipment.date === 'string' && acc.shipment.date.length > 0 ? ', ' : '') + fDate(shipment.date);
            return acc;
        }, {
            shipment: {
                id: 0,
                date: '',
                orderCount: 0,
                productCount: 0,
                productAmount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as unknown as IShipment,
            itemsSummary: [] as ShipmentItemSummary[],
        });

        return summarizedShipmentData;
    };

    const handleSummarizedExportSelectedPdf = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }

        try {
            const summarizedShipmentData = await collectSummarizedShipmentDataForPdf(tableData);
            await generateMultiShipmentPDF([summarizedShipmentData]);
            toast.success('PDF export sikeresen elkészült!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Hiba a PDF exportálása során!');
        }

    }, [selectedRowIds, tableData]);

    const handleExportSelectedToPDF = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const shipmentsData = await collectShipmentsDataForPdf(tableData);
            await generateMultiShipmentPDF(shipmentsData);
            toast.success('PDF export sikeresen elkészült!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Hiba a PDF exportálása során!');
        }
    }, [selectedRowIds, tableData]);

    const handleExportXLS = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const shipmentsData = await collectShipmentsDataForPdf(tableData);
            generateMultiSheetShipmentXLS(shipmentsData);
            toast.success('XLS export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az XLS exportálása során');
        }
    }, [selectedRowIds, tableData]);

    const handleSummarizedExportXLS = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const shipmentsData = await collectSummarizedShipmentDataForPdf(tableData);
            generateMultiSheetShipmentXLS([shipmentsData]);
            toast.success('XLS export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az XLS exportálása során');
        }
    }, [selectedRowIds, tableData]);

    const handleRecalculate = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const selectedShipments = tableData.filter(shipment =>
                selectedRowIds.includes(shipment.id)
            );

            selectedShipments.forEach(async (shipment) => {
                refreshCounts(shipment.id);
            });
            toast.success('Frissítés sikeresen elkészült!');
        } catch (err) {
            console.error('Shipment refresh error:', err);
            toast.error('Hiba az összesítők frissítése során');
        }
    }, [selectedRowIds, tableData]);

    const CustomToolbarCallback = useCallback(
        (props: any) => (
            <CustomToolbar
                {...props}
                filters={filters}
                canReset={canReset}
                selectedRowIds={selectedRowIds}
                filteredResults={dataFiltered.length}
                onOpenConfirmDeleteRows={handleDeleteRowsClick}
                onExportSelectedToPDF={handleExportSelectedToPDF}
                onSummarizedExportSelectedPdf={handleSummarizedExportSelectedPdf}
                onExportSelectedToXLS={handleExportXLS}
                onSummarizedExportSelectedXLS={handleSummarizedExportXLS}
                onRecalculate={handleRecalculate}
            />
        ),
        [selectedRowIds, canReset, dataFiltered.length, handleDeleteRowsClick, handleExportSelectedToPDF, handleSummarizedExportSelectedPdf]
    );

    const columns: GridColDef[] = useMemo(() => [
        {
            field: 'date',
            headerName: 'Szállítás dátuma',
            flex: 1,
            minWidth: 160,
            hideable: false,
            renderCell: (params) => <RenderCellDate params={params} />,
        },
        {
            field: 'orderCount',
            headerName: 'Rendelések száma',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellOrderCount params={params} />,
        },
        {
            field: 'productCount',
            headerName: 'Termékek száma',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellProductCount params={params} />,
        },
        {
            field: 'productAmount',
            headerName: 'Összérték',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => <RenderCellProductAmount params={params} />,
        },
        {
            field: 'updatedAt',
            headerName: 'Frissítve',
            width: 160,
            renderCell: (params) => <RenderCellUpdatedAt params={params} />,
        },
        {
            type: 'actions',
            field: 'actions',
            headerName: 'Műveletek',
            align: 'right',
            headerAlign: 'right',
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            getActions: (params) => [
                <GridActionsLinkItem
                    showInMenu
                    key={`view-${params.row.id}`}
                    icon={<Iconify icon="solar:eye-bold" />}
                    label="Megtekintés"
                    href={paths.dashboard.shipments.details(params.row.id.toString())}
                />,
                <GridActionsCellItem
                    showInMenu
                    key={`delete-${params.row.id}`}
                    icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    label="Törlés"
                    onClick={() => handleDeleteRowClick(params.row.id)}
                    sx={{ color: 'error.main' }}
                />,
            ],
        },
    ], [handleDeleteRowClick]);

    const getTogglableColumns = useCallback(() =>
        columns
            .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
            .map((column) => column.field), [columns]);

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={() => {
                confirmDialog.onFalse();
                setDeleteInfo(null);
            }}
            
            title="Szállítási összesítő törlése"
            content={
                deleteInfo ? (
                    <Box>
                        {deleteInfo.type === 'single' ? (
                            <Box>
                                <Box sx={{ mb: 1 }}>
                                    Biztosan törölni szeretnéd ezt a szállítási összesítőt?
                                </Box>
                                {deleteInfo.orderCount > 0 ? (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'warning.lighter',
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'warning.main'
                                    }}>
                                        <Box sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}>
                                            ⚠️ Figyelem!
                                        </Box>
                                        <Box sx={{ mb: 1 }}>
                                            Ehhez a szállítási összesítőhöz <strong>{deleteInfo.orderCount} rendelés</strong> tartozik.
                                        </Box>
                                        <Box sx={{ color: 'text.secondary' }}>
                                            A törlés előtt kérlek helyezd át ezeket a rendeléseket egy másik összesítőbe, vagy távolítsd el őket az összesítőből.
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'success.lighter',
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'success.main'
                                    }}>
                                        <Box sx={{ color: 'success.dark' }}>
                                            ✅ Nincs rendelés hozzárendelve ehhez az összesítőhöz. Biztonságosan törölhető.
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box>
                                <Box sx={{ mb: 1 }}>
                                    Biztosan törölni szeretnéd ezt a <strong>{selectedRowIds.length}</strong> szállítási összesítőt?
                                </Box>
                                {deleteInfo.orderCount > 0 ? (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'warning.lighter',
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'warning.main'
                                    }}>
                                        <Box sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}>
                                            ⚠️ Figyelem!
                                        </Box>
                                        <Box sx={{ mb: 1 }}>
                                            A kiválasztott összesítőkhöz összesen <strong>{deleteInfo.orderCount} rendelés</strong> tartozik.
                                        </Box>
                                        <Box sx={{ color: 'text.secondary' }}>
                                            Csak azok az összesítők törölhetők, amelyekhez nincs rendelés hozzárendelve.
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'success.lighter',
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'success.main'
                                    }}>
                                        <Box sx={{ color: 'success.dark' }}>
                                            ✅ Nincs rendelés hozzárendelve ezekhez az összesítőkhöz. Biztonságosan törölhetők.
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box>Biztosan törölni szeretnéd?</Box>
                )
            }
            action={
                <Box sx={{ display: 'flex', gap: 2 }}>
                    
                    <Button
                        variant="contained"
                        color={deleteInfo?.orderCount === 0 ? "error" : "warning"}
                        disabled={deleteInfo?.orderCount ? deleteInfo.orderCount > 0 : false}
                        onClick={() => {
                            if (deleteInfo?.type === 'single') {
                                handleDeleteRow(deleteInfo.shipmentId);
                            } else {
                                handleDeleteRows();
                            }
                            confirmDialog.onFalse();
                            setDeleteInfo(null);
                        }}
                    >
                        {deleteInfo?.orderCount === 0 ? "Törlés" : "Nem törölhető"}
                    </Button>
                </Box>
            }
        />
    );

    return (
        <>
            <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <CustomBreadcrumbs
                    heading="Összesítők"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Összesítők', href: paths.dashboard.shipments.root },
                        { name: 'Lista' },
                    ]}
                    action={
                        <>
                            <Button
                                onClick={newShipmentModal.onTrue}
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                            >
                                Új összesítő
                            </Button>
                            <Button
                                component={RouterLink}
                                href="#"
                                onClick={shipmentsMutate}
                                variant="contained"
                                startIcon={<Iconify icon="solar:restart-bold" />}
                            >
                                Frissítés
                            </Button>
                        </>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card
                    sx={{
                        minHeight: 640,
                        flexGrow: { md: 1 },
                        display: { md: 'flex' },
                        height: { xs: 800, md: '1px' },
                        flexDirection: { md: 'column' },
                    }}
                >
                    <DataGrid
                        checkboxSelection
                        disableRowSelectionOnClick
                        rows={dataFiltered}
                        columns={columns}
                        loading={shipmentsLoading}
                        getRowHeight={() => 'auto'}
                        pageSizeOptions={[5, 10, 20, 50, { value: -1, label: 'Összes' }]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        onRowSelectionModelChange={(newSelectionModel) =>
                            setSelectedRowIds(newSelectionModel)
                        }
                        columnVisibilityModel={columnVisibilityModel}
                        onColumnVisibilityModelChange={(newModel) =>
                            setColumnVisibilityModel(newModel)
                        }
                        slots={{
                            toolbar: CustomToolbarCallback,
                            noRowsOverlay: () => <EmptyContent />,
                            noResultsOverlay: () => (
                                <EmptyContent title="Nincsenek megjeleníthető elemek" />
                            ),
                        }}
                        slotProps={{
                            toolbar: { setFilterButtonEl },
                            panel: { anchorEl: filterButtonEl },
                            //columnsManagement: { getTogglableColumns },
                        }}
                        sx={{
                            [`& .${gridClasses.cell}`]: {
                                alignItems: 'center',
                                display: 'inline-flex',
                            },
                        }}
                    />
                </Card>
            </DashboardContent>

            <NewShipmentModal
                open={newShipmentModal.value}
                onClose={newShipmentModal.onFalse}
            />

            {renderConfirmDialog()}
        </>
    );
}

// ----------------------------------------------------------------------

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
    }
}

type CustomToolbarProps = GridSlotProps['toolbar'] & {
    canReset: boolean;
    filteredResults: number;
    selectedRowIds: GridRowSelectionModel;
    filters: UseSetStateReturn<IShipmentsTableFilters>;
    onOpenConfirmDeleteRows: () => void;
    onExportSelectedToPDF: () => void;
    onSummarizedExportSelectedPdf: () => void;
    onExportSelectedToXLS: () => void;
    onSummarizedExportSelectedXLS: () => void;
    onRecalculate: () => void;
};

const CustomToolbar = memo(function CustomToolbar({
    filters,
    canReset,
    selectedRowIds,
    filteredResults,
    setFilterButtonEl,
    onOpenConfirmDeleteRows,
    onExportSelectedToPDF,
    onSummarizedExportSelectedPdf,
    onExportSelectedToXLS,
    onSummarizedExportSelectedXLS,
    onRecalculate
}: CustomToolbarProps) {
    return (
        <>
            <GridToolbarContainer>
                <ShipmentsTableToolbar filters={filters} options={{}} />
                <GridToolbarQuickFilter />
                <Box
                    sx={{
                        gap: 1,
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {!!selectedRowIds.length && (
                        <>
                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="solar:restart-bold" />}
                                onClick={onRecalculate}
                            >
                                Újrakalkulálás
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:pdf-fill" />}
                                onClick={onSummarizedExportSelectedPdf}
                            >
                                Összevont PDF nyomtatás
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:pdf-fill" />}
                                onClick={onExportSelectedToPDF}
                            >
                                Különálló PDF nyomtatás ({selectedRowIds.length})
                            </Button>

                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:table-2-fill" />}
                                onClick={onSummarizedExportSelectedXLS}
                            >
                                Összevont XLS nyomtatás
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:table-2-fill" />}
                                onClick={onExportSelectedToXLS}
                            >
                                XLS nyomtatás ({selectedRowIds.length})
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                onClick={onOpenConfirmDeleteRows}
                            >
                                Törlés ({selectedRowIds.length})
                            </Button>
                        </>
                    )}
                </Box>
            </GridToolbarContainer>
            {canReset && (
                <ShipmentsTableFiltersResult
                    filters={filters}
                    totalResults={filteredResults}
                    sx={{ p: 2.5, pt: 0 }}
                />
            )}
        </>
    );
});

// ----------------------------------------------------------------------

type GridActionsLinkItemProps = Pick<GridActionsCellItemProps, 'icon' | 'label' | 'showInMenu'> & {
    href: string;
    sx?: SxProps<Theme>;
    ref?: React.RefObject<HTMLLIElement | null>;
    target?: string;
};

export function GridActionsLinkItem({
    ref,
    href,
    label,
    icon,
    sx,
    target,
}: GridActionsLinkItemProps) {
    return (
        <MenuItem ref={ref} sx={sx}>
            <Link
                component={RouterLink}
                href={href}
                target={target}
                underline="none"
                color="inherit"
                sx={{ width: 1, display: 'flex', alignItems: 'center' }}
            >
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                {label}
            </Link>
        </MenuItem>
    );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
    inputData: IShipment[];
    filters: IShipmentsTableFilters;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
    // No filters implemented yet, return original data
    return inputData;
}