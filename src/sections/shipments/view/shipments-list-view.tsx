'use client';

import type { Theme, SxProps } from '@mui/material/styles';
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

import { DashboardContent } from 'src/layouts/dashboard';
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

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

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

    const CustomToolbarCallback = useCallback(
        (props: any) => (
            <CustomToolbar
                {...props}
                filters={filters}
                canReset={canReset}
                selectedRowIds={selectedRowIds}
                filteredResults={dataFiltered.length}
                onOpenConfirmDeleteRows={confirmDialog.onTrue}
            />
        ),
        [selectedRowIds, canReset, dataFiltered.length, confirmDialog.onTrue]
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
};

const CustomToolbar = memo(function CustomToolbar({
    filters,
    canReset,
    selectedRowIds,
    filteredResults,
    setFilterButtonEl,
    onOpenConfirmDeleteRows,
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
                            >
                                PDF nyomtatás ({selectedRowIds.length})
                            </Button>
                            <Button
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:table-2-fill" />}
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
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton ref={setFilterButtonEl} />
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