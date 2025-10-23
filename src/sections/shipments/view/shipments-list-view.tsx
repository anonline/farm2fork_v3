'use client';

import type { IProductItem } from 'src/types/product';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IOrderData, IOrderItem } from 'src/types/order-management';
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
import { generateOrderAddressPDF } from 'src/utils/order-address-pdf-export';
import { generateMultiSheetShipmentXLS } from 'src/utils/shipment-xls-export';
import { fetchCategoryConnectionsForShipments } from 'src/utils/pdf-generator';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchGetProductsByIds } from 'src/actions/product';
import { useGetCategoryOrder } from 'src/actions/category-order';
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

    for (const order of orders) {
        for (const item of order.items) {
            const key = `${item.id}-${item.name}-${item.size || ''}-${item.unit || ''}`;

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
        }
    }

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
            productData,
        };
    }).sort((a, b) => b.totalValue - a.totalValue);

    // Expand bundle items
    const expandedItems: ShipmentItemSummary[] = [];
    for (const item of summaryItems) {
        // Add the main product
        expandedItems.push(item);

        // If it's a bundle product, add its bundle items
        if (item.productData?.type === 'bundle' && item.productData?.bundleItems && item.productData.bundleItems.length > 0) {
            for (const bundleItem of item.productData.bundleItems) {
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
                    isBundleItem: true,
                    parentQuantity: item.totalQuantity,
                    individualQuantity: bundleItem.qty,
                });
            }
        }
    }

    return expandedItems;
}

// ----------------------------------------------------------------------

export function ShipmentsListView() {
    const confirmDialog = useBoolean();
    const newShipmentModal = useBoolean();

    const { shipments, shipmentsLoading, shipmentsMutate, deleteShipment, refreshCounts } = useShipments();
    const { categoryOrder } = useGetCategoryOrder();

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
                    
                    // Update bundle item quantities
                    if (item.isBundleItem && item.parentQuantity && item.individualQuantity) {
                        existingItem.parentQuantity = (existingItem.parentQuantity || 0) + item.parentQuantity;
                        existingItem.individualQuantity = item.individualQuantity; // Keep the same individual quantity
                    }
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
            const categoryConnections = await fetchCategoryConnectionsForShipments([summarizedShipmentData]);
            await generateMultiShipmentPDF([summarizedShipmentData], categoryOrder, categoryConnections);
            toast.success('PDF export sikeresen elkészült!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Hiba a PDF exportálása során!');
        }

    }, [selectedRowIds, tableData, categoryOrder]);

    const handleExportSelectedToPDF = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const shipmentsData = await collectShipmentsDataForPdf(tableData);
            const categoryConnections = await fetchCategoryConnectionsForShipments(shipmentsData);
            await generateMultiShipmentPDF(shipmentsData, categoryOrder, categoryConnections);
            toast.success('PDF export sikeresen elkészült!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Hiba a PDF exportálása során!');
        }
    }, [selectedRowIds, tableData, categoryOrder]);

    const handleExportXLS = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const shipmentsData = await collectShipmentsDataForPdf(tableData);
            
            // Fetch category connections for all shipments
            const allItemsSummaries = shipmentsData.flatMap(s => s.itemsSummary);
            const categoryConnections = await fetchCategoryConnectionsForShipments(allItemsSummaries as any);
            
            generateMultiSheetShipmentXLS(shipmentsData, categoryOrder, categoryConnections);
            toast.success('XLS export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az XLS exportálása során');
        }
    }, [selectedRowIds, tableData, categoryOrder]);

    const handleSummarizedExportXLS = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }
        try {
            const summarizedShipmentData = await collectSummarizedShipmentDataForPdf(tableData);
            
            // Fetch category connections for summarized shipment - wrap in array format
            const categoryConnections = await fetchCategoryConnectionsForShipments([summarizedShipmentData] as any);
            
            generateMultiSheetShipmentXLS([summarizedShipmentData], categoryOrder, categoryConnections);
            toast.success('XLS export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az XLS exportálása során');
        }
    }, [selectedRowIds, tableData, categoryOrder]);

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

    const handleExportByShipmentMethod = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }

        try {
            const selectedShipments = tableData.filter(shipment =>
                selectedRowIds.includes(shipment.id)
            );

            // Fetch all orders for selected shipments
            const allOrders: IOrderData[] = [];
            for (const shipment of selectedShipments) {
                const ordersResult = await getOrdersByShipmentId(shipment.id);
                if (!ordersResult.error && ordersResult.orders) {
                    allOrders.push(...ordersResult.orders);
                }
            }

            if (allOrders.length === 0) {
                toast.warning('Nincsenek rendelések a kiválasztott szállítási összesítőkben!');
                return;
            }

            // Group orders by shipment method
            const ordersByShipmentMethod: Record<string, IOrderData[]> = {};
            const pickupOrders: Record<string, IOrderData[]> = {}; // For pickup locations

            allOrders.forEach(order => {
                const shipBy = order.shippingMethod?.name || 'Ismeretlen';
                
                if (shipBy === 'Személyes átvétel') {
                    // Group pickup orders by pickup location
                    // For pickup orders, we need to get the pickup location from shippingAddress
                    const pickupLocationId = order.shippingAddress?.id || 'Ismeretlen átvételi pont'; 
                    if (!pickupOrders[pickupLocationId]) {
                        pickupOrders[pickupLocationId] = [];
                    }
                    pickupOrders[pickupLocationId].push(order);
                } else {
                    // Group other shipment methods normally
                    if (!ordersByShipmentMethod[shipBy]) {
                        ordersByShipmentMethod[shipBy] = [];
                    }
                    ordersByShipmentMethod[shipBy].push(order);
                }
            });

            // Fetch pickup locations for resolving names
            const pickupLocationsResponse = await import('src/lib/supabase')
                .then(async (supabaseModule) => {
                    const { data: locations } = await supabaseModule.supabase
                        .from('PickupLocations')
                        .select('*')
                        .order('name', { ascending: true });
                    return locations || [];
                })
                .catch(() => []);

            // Create summary data for export
            const summaryData: Array<{
                shipment: IShipment;
                itemsSummary: ShipmentItemSummary[];
                groupType: 'shipment_method' | 'pickup_location';
                groupName: string;
                orders: IOrderData[];
            }> = [];

            // Process shipment method groups
            Object.entries(ordersByShipmentMethod).forEach(([method, orders]) => {
                const groupSummary = createGroupSummary(orders, method, 'shipment_method');
                summaryData.push(groupSummary);
            });

            // Process pickup location groups
            Object.entries(pickupOrders).forEach(([locationId, orders]) => {
                const pickupLocation = pickupLocationsResponse.find(loc => loc.id.toString() === locationId);
                const locationName = pickupLocation ? 
                    `${pickupLocation.name} (${pickupLocation.postcode} ${pickupLocation.city} ${pickupLocation.address})` : 
                    `Átvételi pont #${locationId}`;
                
                const groupSummary = createGroupSummary(orders, locationName, 'pickup_location');
                summaryData.push(groupSummary);
            });

            // Generate export (using existing PDF export function as base)
            const categoryConnections = await fetchCategoryConnectionsForShipments(summaryData);
            await generateMultiShipmentPDF(summaryData, categoryOrder, categoryConnections);
            toast.success('Szállítási módok szerinti összesítő PDF export sikeresen elkészült!');

        } catch (error) {
            console.error('Export by shipment method error:', error);
            toast.error('Hiba a szállítási módok szerinti exportálás során!');
        }
    }, [selectedRowIds, tableData]);

    const handleExportAddressList = useCallback(async () => {
        if (selectedRowIds.length === 0) {
            toast.warning('Kérlek válassz legalább egy szállítási összesítőt!');
            return;
        }

        try {
            const selectedShipments = tableData.filter(shipment =>
                selectedRowIds.includes(shipment.id)
            );

            // Fetch all orders for selected shipments
            const allOrders: IOrderData[] = [];
            for (const shipment of selectedShipments) {
                const ordersResult = await getOrdersByShipmentId(shipment.id);
                if (!ordersResult.error && ordersResult.orders) {
                    allOrders.push(...ordersResult.orders);
                }
            }

            if (allOrders.length === 0) {
                toast.warning('Nincsenek rendelések a kiválasztott szállítási összesítőkben!');
                return;
            }

            // Generate title/subtitle based on selected shipments
            const shipmentDates = selectedShipments
                .map(s => fDate(s.date))
                .filter(d => d !== 'Invalid date')
                .join(', ');
            
            const title = 'Szállítási címlista';
            const subtitle = shipmentDates ? `Szállítás: ${shipmentDates}` : undefined;

            // Generate address list PDF
            await generateOrderAddressPDF(allOrders, title, subtitle);
            toast.success('Címlista PDF export sikeresen elkészült!');

        } catch (error) {
            console.error('Address list export error:', error);
            toast.error('Hiba a címlista exportálása során!');
        }
    }, [selectedRowIds, tableData]);

    // Helper function to create group summary
    const createGroupSummary = useCallback((orders: IOrderData[], groupName: string, groupType: 'shipment_method' | 'pickup_location') => {
        // Create items summary by aggregating order items
        const itemsSummary: ShipmentItemSummary[] = [];
        const itemsMap = new Map<string, {
            totalQuantity: number;
            totalValue: number;
            orderCount: number;
            customers: Set<string>;
            item: any;
        }>();

        orders.forEach(order => {
            order.items.forEach((item: any) => {
                const key = item.id;
                if (!itemsMap.has(key)) {
                    itemsMap.set(key, {
                        totalQuantity: 0,
                        totalValue: 0,
                        orderCount: 0,
                        customers: new Set(),
                        item
                    });
                }
                
                const mapItem = itemsMap.get(key)!;
                mapItem.totalQuantity += item.quantity;
                mapItem.totalValue += item.subtotal;
                mapItem.orderCount += 1;
                mapItem.customers.add(order.customerName);
            });
        });

        // Convert map to summary array
        itemsMap.forEach((data, itemId) => {
            itemsSummary.push({
                id: itemId,
                name: data.item.name,
                size: data.item.size,
                unit: data.item.unit,
                totalQuantity: data.totalQuantity,
                averagePrice: data.totalValue / data.totalQuantity,
                totalValue: data.totalValue,
                orderCount: data.orderCount,
                customersCount: data.customers.size,
                customers: Array.from(data.customers),
                productId: itemId,
            });
        });

        // Create mock shipment for the group
        const mockShipment: IShipment = {
            id: 0,
            date: groupName, // Use group name as "date" for display
            orderCount: orders.length,
            productCount: itemsSummary.length,
            productAmount: orders.reduce((sum, order) => sum + order.total, 0),
            updatedAt: new Date(),
        };

        return {
            shipment: mockShipment,
            itemsSummary,
            groupType,
            groupName,
            orders
        };
    }, []);

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
                onExportByShipmentMethod={handleExportByShipmentMethod}
                onExportAddressList={handleExportAddressList}
            />
        ),
        [selectedRowIds, canReset, dataFiltered.length, handleDeleteRowsClick, handleExportSelectedToPDF, handleSummarizedExportSelectedPdf, handleExportAddressList]
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
    onExportByShipmentMethod?: () => void;
    onExportAddressList?: () => void;
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
    onRecalculate,
    onExportByShipmentMethod,
    onExportAddressList
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
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    {!!selectedRowIds.length && (
                        <>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="mingcute:pdf-fill" />}
                                onClick={onExportAddressList}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mx: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Címlista
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="carbon:delivery" />}
                                onClick={onExportByShipmentMethod}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mx: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Szállítási mód szerint
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="solar:restart-bold" />}
                                onClick={onRecalculate}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mx: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Újrakalkulálás
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="solar:notes-bold-duotone" />}
                                onClick={onSummarizedExportSelectedPdf}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Összevont PDF
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="mingcute:pdf-fill" />}
                                onClick={onExportSelectedToPDF}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Különálló PDF ({selectedRowIds.length})
                                </Box>
                            </Button>

                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="ic:round-view-list" />}
                                onClick={onSummarizedExportSelectedXLS}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    Összevont XLS
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                variant='outlined'
                                startIcon={<Iconify icon="mingcute:table-2-fill" />}
                                onClick={onExportSelectedToXLS}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    XLS ({selectedRowIds.length})
                                </Box>
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                variant='outlined'
                                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                onClick={onOpenConfirmDeleteRows}
                                sx={{
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    ({selectedRowIds.length})
                                </Box>
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