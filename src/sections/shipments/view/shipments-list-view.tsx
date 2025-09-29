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
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { generateMultiShipmentPDF } from 'src/utils/shipment-pdf-export';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchGetProductsByIds } from 'src/actions/product';
import { getOrdersByShipmentId } from 'src/actions/order-management';
import { useShipments } from 'src/contexts/shipments/shipments-context';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ShipmentsTableToolbar } from '../shipments-table-toolbar';
import { ShipmentsTableFiltersResult } from '../shipments-table-filters-result';
import {
    RenderCellDate,
    RenderCellUpdatedAt,
    RenderCellOrderCount,
    RenderCellProductCount,
    RenderCellProductAmount,
} from '../shipments-table-row';
import { fDate } from 'src/utils/format-time';
import { generateMultiSheetShipmentXLS, generateShipmentXLS } from 'src/utils/shipment-xls-export';

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

    const { shipments, shipmentsLoading, shipmentsMutate } = useShipments();

    const [tableData, setTableData] = useState<IShipment[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

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

    const handleDeleteRow = useCallback(
        async (id: number) => {
            try {
                // TODO: Implement delete shipment API call
                // await deleteShipment(id);

                const updatedShipments = tableData.filter((row) => row.id !== id);
                setTableData(updatedShipments);

                toast.success('Törlés sikeres!');
            } catch (error) {
                console.error(error);
                toast.error('A törlés sikertelen!');
            }
        },
        [tableData]
    );

    const handleDeleteRows = useCallback(async () => {
        try {
            // TODO: Implement batch delete shipments API call
            // await Promise.all(selectedRowIds.map((id) => deleteShipment(Number(id))));

            const updatedShipments = tableData.filter((row) => !selectedRowIds.includes(row.id));
            setTableData(updatedShipments);

            toast.success('Törlés sikeres!');
            setSelectedRowIds([]);
        } catch (error) {
            console.error(error);
            toast.error('A tömeges törlés sikertelen!');
        }
    }, [selectedRowIds, tableData]);

    const collectShipmentsDataForPdf = async (tableData: IShipment[]) => {
        const selectedShipments = tableData.filter(shipment =>
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

    const collectSummarizedShipmentDataForPdf = async (tableData: IShipment[]) => {
        const shipmentsData = await collectShipmentsDataForPdf(tableData);
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

    const CustomToolbarCallback = useCallback(
        (props: any) => (
            <CustomToolbar
                {...props}
                filters={filters}
                canReset={canReset}
                selectedRowIds={selectedRowIds}
                filteredResults={dataFiltered.length}
                onOpenConfirmDeleteRows={confirmDialog.onTrue}
                onExportSelectedToPDF={handleExportSelectedToPDF}
                onSummarizedExportSelectedPdf={handleSummarizedExportSelectedPdf}
                onExportSelectedToXLS={handleExportXLS}
                onSummarizedExportSelectedXLS={handleSummarizedExportXLS}
            />
        ),
        [selectedRowIds, canReset, dataFiltered.length, confirmDialog.onTrue, handleExportSelectedToPDF, handleSummarizedExportSelectedPdf]
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
                    onClick={() => handleDeleteRow(params.row.id)}
                    sx={{ color: 'error.main' }}
                />,
            ],
        },
    ], [handleDeleteRow]);

    const getTogglableColumns = useCallback(() =>
        columns
            .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
            .map((column) => column.field), [columns]);

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content={
                <>
                    Biztosan törölni szeretnéd ezt a <strong> {selectedRowIds.length} </strong>{' '}
                    elemet?
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
                                component={RouterLink}
                                href="#"
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