'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProductItem, IProductTableFilters } from 'src/types/product';
import type {
    GridColDef,
    GridSlotProps,
    GridRowSelectionModel,
    GridActionsCellItemProps,
    GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
    DataGrid,
    gridClasses,
    GridToolbarExport,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableFiltersResult } from '../product-table-filters-result';
import {
    RenderCellBio,
    RenderCellStock,
    RenderCellPrice,
    RenderCellPublish,
    RenderCellProduct,
    RenderCellCreatedAt,
    RenderCellUnit,
    RenderCellTags,
    RenderCellCategories,
    RenderCellGrossPrice,
} from '../product-table-row';
import { RenderCellCategory } from 'src/sections/category/category-table-row';
import { useProducts } from 'src/contexts/products-context';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
    { value: 'true', label: 'Közzétéve' },
    { value: 'false', label: 'Rejtve' },
];

const BIO_OPTIONS = [
    { value: 'true', label: 'BIO' },
    { value: 'false', label: 'Nem BIO' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function ProductListView() {
    const confirmDialog = useBoolean();

    const { products, loading: productsLoading } = useProducts();

    const [tableData, setTableData] = useState<IProductItem[]>(products);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

    const filters = useSetState<IProductTableFilters>({ publish: [], stock: [], bio: [] });
    const { state: currentFilters } = filters;

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

    useEffect(() => {
        if (products.length) {
            setTableData(products);
        }
    }, [products]);

    const canReset = currentFilters.publish.length > 0 || currentFilters.stock.length > 0 || currentFilters.bio.length > 0;

    const dataFiltered = applyFilter({
        inputData: tableData,
        filters: currentFilters,
    });

    const handleDeleteRow = useCallback(
        (id: number) => {
            const deleteRow = tableData.filter((row) => row.id !== id);

            toast.success('Delete success!');

            setTableData(deleteRow);
        },
        [tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

        toast.success('Delete success!');

        setTableData(deleteRows);
    }, [selectedRowIds, tableData]);

    const CustomToolbarCallback = useCallback(
        () => (
            <CustomToolbar
                filters={filters}
                canReset={canReset}
                selectedRowIds={selectedRowIds}
                setFilterButtonEl={setFilterButtonEl}
                filteredResults={dataFiltered.length}
                onOpenConfirmDeleteRows={confirmDialog.onTrue}
            />
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentFilters, selectedRowIds]
    );

    const columns: GridColDef[] = [
        { field: 'category', headerName: 'Category', filterable: false },
        {
            field: 'publish',
            headerName: 'Aktív',
            width: 110,
            renderCell: (params) => <RenderCellPublish params={params} />,
        },
        {
            field: 'bio',
            headerName: 'Bio',
            width: 90,

            renderCell: (params) => <RenderCellBio params={params} />,
        },
        {
            field: 'name',
            headerName: 'Termék',
            flex: 1,
            minWidth: 360,
            hideable: false,
            renderCell: (params) => (
                <RenderCellProduct
                    params={params}
                    href={paths.dashboard.product.details(params.row.id)}
                />
            ),
        },
        {
            field: 'inventoryType',
            headerName: 'Készlet',
            width: 100,
            editable: false,

            renderCell: (params) => <RenderCellStock params={params} />,
        },
        {
            field: 'price',
            headerName: 'nettó Ár',
            width: 140,
            editable: false,

            renderCell: (params) => <RenderCellPrice params={params} />,
        },
        {
            field: 'grossprice',
            headerName: 'bruttó Ár',
            width: 140,
            editable: false,
            renderCell: (params) => <RenderCellGrossPrice params={params} />,
        },
        {
            field: 'tags',
            headerName: 'Címkék',
            width: 240,
            editable: false,

            renderCell: (params) => <RenderCellTags params={params} />,
        },
        {
            field: 'categories',
            headerName: 'Kategóriák',
            width: 160,
            editable: false,

            renderCell: (params) => <RenderCellCategories params={params} />,
        },
        {
            type: 'actions',
            field: 'actions',
            headerName: ' ',
            align: 'right',
            headerAlign: 'right',
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            getActions: (params) => [
                <GridActionsLinkItem
                    showInMenu
                    icon={<Iconify icon="solar:eye-bold" />}
                    label="Megtekintés"
                    target='_blank'
                    href={paths.product.details(params.row.url)}
                />,
                <GridActionsLinkItem
                    showInMenu
                    icon={<Iconify icon="solar:pen-bold" />}
                    label="Szerkesztés"
                    href={paths.dashboard.product.edit(params.row.id)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    label="Törlés"
                    onClick={() => handleDeleteRow(params.row.id)}
                    sx={{ color: 'error.main' }}
                />,
            ],
        },
    ];

    const getTogglableColumns = () =>
        columns
            .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
            .map((column) => column.field);

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content={
                <>
                    Biztosan törölni szeretné a kijelölt <strong> {selectedRowIds.length} </strong> elemet?
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
                    heading="Összes termék"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Termékek', href: paths.dashboard.product.root },
                        { name: 'Összes termék' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.product.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új termék
                        </Button>
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
                        loading={productsLoading}
                        getRowHeight={() => 'auto'}
                        pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
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
                            noResultsOverlay: () => <EmptyContent title="Nincs találat." />,
                        }}
                        slotProps={{
                            toolbar: { setFilterButtonEl },
                            panel: { anchorEl: filterButtonEl },
                            columnsManagement: { getTogglableColumns },
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
    filters: UseSetStateReturn<IProductTableFilters>;

    onOpenConfirmDeleteRows: () => void;
};

function CustomToolbar({
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
                <ProductTableToolbar
                    filters={filters}
                    options={{
                        //stocks: PRODUCT_STOCK_OPTIONS,
                        publishs: PUBLISH_OPTIONS,
                        bios: BIO_OPTIONS,
                    }}
                />

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
                        <Button
                            size="small"
                            color="error"
                            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            onClick={onOpenConfirmDeleteRows}
                        >
                            Delete ({selectedRowIds.length})
                        </Button>
                    )}

                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton ref={setFilterButtonEl} />
                    {/* <GridToolbarExport /> */}
                </Box>
            </GridToolbarContainer>

            {canReset && (
                <ProductTableFiltersResult
                    filters={filters}
                    totalResults={filteredResults}
                    sx={{ p: 2.5, pt: 0 }}
                />
            )}
        </>
    );
}

// ----------------------------------------------------------------------

type GridActionsLinkItemProps = Pick<GridActionsCellItemProps, 'icon' | 'label' | 'showInMenu'> & {
    href: string;
    sx?: SxProps<Theme>;
    ref?: React.RefObject<HTMLLIElement | null>;
    target?: string;
};

export function GridActionsLinkItem({ ref, href, label, icon, sx, target }: GridActionsLinkItemProps) {
    return (
        <MenuItem ref={ref} sx={sx}>
            <Link
                component={RouterLink}
                href={href}
                underline="none"
                color="inherit"
                sx={{ width: 1, display: 'flex', alignItems: 'center' }}
                target={target}
            >
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                {label}
            </Link>
        </MenuItem>
    );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
    inputData: IProductItem[];
    filters: IProductTableFilters;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
    const { stock, publish, bio } = filters;

    if (stock.length) {
        inputData = inputData.filter((product) => stock.includes(product.inventoryType));
    }

    if (publish.length) {
        inputData = inputData.filter((product) => publish.includes(product.publish ? 'true' : 'false'));
    }

    if (bio.length) {
        inputData = inputData.filter((product) => bio.includes(product.bio ? 'true' : 'false'));
    }

    return inputData;
}
