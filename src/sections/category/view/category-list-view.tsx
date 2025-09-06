'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ICategoryItem, ICategoryTableFilter } from 'src/types/category';
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
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteCategoriesByIds } from 'src/actions/category';
import { useCategories } from 'src/contexts/category-context';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryTableToolbar } from '../category-table-toolbar';
import { CategoryTableFiltersResult } from '../category-table-filters-result';
import { RenderCellEnabled, RenderCellCategory, RenderCellCreatedAt } from '../category-table-row';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function CategoryListView() {
    const confirmDialog = useBoolean();

    const { categories, loading } = useCategories();

    const [tableData, setTableData] = useState<ICategoryItem[]>(categories);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

    useEffect(() => {
        setTableData(categories);
    }, [categories]);

    const filters = useSetState<ICategoryTableFilter>();
    const { state: currentFilters } = filters;

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

    const canReset = false;

    const dataFiltered = applyFilter({
        inputData: tableData,
        filters: currentFilters,
    });

    const doDelete = async (ids: number[]) => {
        await deleteCategoriesByIds(ids);
    };

    const handleDeleteRows = useCallback(async () => {
        const deleteRows = tableData.filter(
            (row) => row.id !== null && !selectedRowIds.includes(row.id)
        );
        await doDelete(selectedRowIds as number[]);
        setTableData(deleteRows);
        toast.success('Sikeres törlés!');
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
            field: 'enabled',
            headerName: 'Aktív',
            width: 110,
            renderCell: (params) => <RenderCellEnabled params={params} />,
        },
        {
            field: 'name',
            headerName: 'Termék kategória',
            flex: 1,
            minWidth: 360,
            hideable: false,
            renderCell: (params) => (
                <RenderCellCategory
                    params={params}
                    href={paths.dashboard.product.categories.edit(params.row.id)}
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Létrehozva',
            width: 160,
            renderCell: (params) => <RenderCellCreatedAt params={params} />,
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
                    href={paths.categories.list(params.row.slug)}
                    target="_blank"
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
            title="Törlés megerősítése"
            content={
                <>
                    Biztosan törölni akarja a(z) <strong> {selectedRowIds.length} </strong> elemet?
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
                    heading="Termék kategóriák"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Termékek', href: paths.dashboard.product.root },
                        { name: 'Kategóriák', href: paths.dashboard.product.categories.root },
                        { name: 'Lista' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.product.categories.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új kategória
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
                        loading={loading}
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
                            noResultsOverlay: () => (
                                <EmptyContent title="Nem található kategória." />
                            ),
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
    filters: UseSetStateReturn<ICategoryTableFilter>;

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
                <CategoryTableToolbar filters={filters} options={{}} />

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
                            Törlés ({selectedRowIds.length})
                        </Button>
                    )}

                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton ref={setFilterButtonEl} />
                </Box>
            </GridToolbarContainer>

            {canReset && (
                <CategoryTableFiltersResult
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
                target={target ?? ''}
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
    inputData: ICategoryItem[];
    filters: ICategoryTableFilter;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
    console.log('applyFilter inputData:', inputData);
    console.log('applyFilter filters:', filters);
    // ...filter logika...
    return inputData;
}
