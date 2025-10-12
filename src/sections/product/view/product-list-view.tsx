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
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { generateProductsXLS } from 'src/utils/product-xls-export';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProducts } from 'src/contexts/products-context';
import { useCategories } from 'src/contexts/category-context';
import { deleteProduct, deleteProducts } from 'src/actions/product';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableFiltersResult } from '../product-table-filters-result';
import {
    RenderCellBio,
    RenderCellTags,
    RenderCellStock,
    RenderCellPrice,
    RenderCellPublish,
    RenderCellProduct,
    RenderCellCategories,
    RenderCellGrossPrice,
} from '../product-table-row';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
    { value: 'true', label: 'Elérhető' },
    { value: 'false', label: 'Rejtve' },
];

const BIO_OPTIONS = [
    { value: 'true', label: 'BIO' },
    { value: 'false', label: 'Nem BIO' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

const NoRowsOverlay = () => <EmptyContent />;

const NoResultsOverlay = () => <EmptyContent title="Nincs találat." />;

// ----------------------------------------------------------------------

export function ProductListView() {
    const confirmDialog = useBoolean();

    const { products, loading: productsLoading, refreshProducts } = useProducts();
    const { allCategories } = useCategories();

    const [tableData, setTableData] = useState<IProductItem[]>(products);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

    const filters = useSetState<IProductTableFilters>({ publish: [], stock: [], bio: [], categories: [] });
    const { state: currentFilters } = filters;

    const initState = useBoolean(true);

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

    useEffect(() => {
        if (products.length) {
            setTableData(products);
            // Set default filter to published products only after data is loaded
            if (initState.value) {
                filters.setState({ publish: ['true'], stock: [], bio: [], categories: [] });
                initState.onFalse();
            }
        }
    }, [products, currentFilters.publish.length, currentFilters.stock.length, currentFilters.bio.length, currentFilters.categories.length, filters]);

    const canReset =
        currentFilters.publish.length > 0 ||
        currentFilters.stock.length > 0 ||
        currentFilters.bio.length > 0 ||
        currentFilters.categories.length > 0;

    const dataFiltered = applyFilter({
        inputData: tableData,
        filters: currentFilters,
    });

    const handleDeleteRow = useCallback(
        async (id: string) => {
            try {
                await deleteProduct(id);
                await refreshProducts();
                toast.success('Termék sikeresen törölve!');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error instanceof Error ? error.message : 'Hiba a termék törlése során');
            }
        },
        [refreshProducts]
    );

    const handleDeleteRows = useCallback(async () => {
        try {
            const idsToDelete = selectedRowIds.map(id => String(id));
            await deleteProducts(idsToDelete);
            await refreshProducts();
            toast.success(`${idsToDelete.length} termék sikeresen törölve!`);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error instanceof Error ? error.message : 'Hiba a termékek törlése során');
        }
    }, [selectedRowIds, refreshProducts]);

    const handleExportAllToXLS = useCallback(() => {
        try {
            // Export ALL products, not just filtered ones
            generateProductsXLS(products);
            toast.success('Excel export sikeresen elkészült!');
        } catch (err) {
            console.error('XLS export error:', err);
            toast.error('Hiba az Excel exportálása során');
        }
    }, [products]);

    const categoryOptions = allCategories
        .filter((cat) => cat.enabled)
        .map((cat) => ({ 
            value: String(cat.id), 
            label: cat.name,
            level: cat.level 
        }));
    
    console.log('allCategories:', allCategories.length, 'enabled:', categoryOptions.length);

    const CustomToolbarCallback = useCallback(
        () => (
            <CustomToolbar
                filters={filters}
                canReset={canReset}
                selectedRowIds={selectedRowIds}
                setFilterButtonEl={setFilterButtonEl}
                filteredResults={dataFiltered.length}
                onOpenConfirmDeleteRows={confirmDialog.onTrue}
                categoryOptions={categoryOptions}
                onExportAllToXLS={handleExportAllToXLS}
            />
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentFilters, selectedRowIds, categoryOptions, handleExportAllToXLS]
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
                    href={paths.dashboard.product.edit(params.row.url)}
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
            headerName: 'Keresési szinonímák',
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
                    key={`view-${params.row.id}`}
                    icon={<Iconify icon="solar:eye-bold" />}
                    label="Megtekintés"
                    target="_blank"
                    href={paths.product.details(params.row.url)}
                />,
                <GridActionsLinkItem
                    showInMenu
                    key={`edit-${params.row.id}`}
                    icon={<Iconify icon="solar:pen-bold" />}
                    label="Szerkesztés"
                    href={paths.dashboard.product.edit(params.row.url)}
                />,
                <GridActionsCellItem
                    showInMenu
                    key={`delete-${params.row.id}`}
                    icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    label="Törlés"
                    onClick={() => {
                        handleDeleteRow(params.row.id);
                    }}
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
                    Biztosan törölni szeretné a kijelölt <strong> {selectedRowIds.length} </strong>{' '}
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
                        minHeight: 840,
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
                        pageSizeOptions={[5, 10, 20, 50, 100, { value: -1, label: 'Összes' }]}
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
                            noRowsOverlay: NoRowsOverlay,
                            noResultsOverlay: NoResultsOverlay,
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
    categoryOptions: { value: string; label: string; level: number }[];
    onOpenConfirmDeleteRows: () => void;
    onExportAllToXLS: () => void;
};

function CustomToolbar({
    filters,
    canReset,
    selectedRowIds,
    filteredResults,
    setFilterButtonEl,
    onOpenConfirmDeleteRows,
    categoryOptions,
    onExportAllToXLS,
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
                        categories: categoryOptions,
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

                    <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        startIcon={<Iconify icon="mingcute:table-2-fill" />}
                        onClick={onExportAllToXLS}
                    >
                        Export XLS
                    </Button>

                    <GridToolbarColumnsButton />
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
    const { stock, publish, bio, categories } = filters;

    if (stock.length) {
        inputData = inputData.filter((product) => stock.includes(product.inventoryType));
    }

    if (publish.length) {
        inputData = inputData.filter((product) =>
            publish.includes(product.publish ? 'true' : 'false')
        );
    }

    if (bio.length) {
        inputData = inputData.filter((product) => bio.includes(product.bio ? 'true' : 'false'));
    }

    if (categories.length) {
        inputData = inputData.filter((product) => {
            if (!product.category || product.category.length === 0) return false;
            return product.category.some((cat) => categories.includes(String(cat.id)));
        });
    }

    return inputData;
}
