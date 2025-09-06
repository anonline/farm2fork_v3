'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProducerItem, IProducerTableFilters } from 'src/types/producer';
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

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteProducer, useGetProducers } from 'src/actions/producer';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProducerTableToolbar } from '../producer-table-toolbar';
import { ProducerTableFiltersResult } from '../producer-table-filters-result';
import {
    RenderCellBio,
    RenderCellName,
    RenderCellCreatedAt,
    RenderCellProducingTags,
} from '../producer-table-row';

// ----------------------------------------------------------------------

const BIO_OPTIONS = [
    { value: 'true', label: 'BIO' },
    { value: 'false', label: 'Nem BIO' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function ProducerListView() {
    const confirmDialog = useBoolean();

    const { producers, producersLoading, producersMutate } = useGetProducers();

    const [tableData, setTableData] = useState<IProducerItem[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

    const filters = useSetState<IProducerTableFilters>({ bio: [] });
    const { state: currentFilters } = filters;

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

    useEffect(() => {
        setTableData(producers);
    }, [producers]);

    const canReset = currentFilters.bio.length > 0;

    const dataFiltered = applyFilter({
        inputData: tableData,
        filters: currentFilters,
    });

    const handleDeleteRow = useCallback(
        async (id: number) => {
            try {
                await deleteProducer(id);

                const updatedProducers = tableData.filter((row) => row.id !== id);
                producersMutate({ producers: updatedProducers }, false);

                toast.success('Törlés sikeres!');
            } catch (error) {
                console.error(error);
                toast.error('A törlés sikertelen!');
            }
        },
        [tableData, producersMutate]
    );

    const handleDeleteRows = useCallback(async () => {
        try {
            await Promise.all(selectedRowIds.map((id) => deleteProducer(Number(id))));

            const updatedProducers = tableData.filter((row) => !selectedRowIds.includes(row.id));
            producersMutate({ producers: updatedProducers }, false);

            toast.success('Törlés sikeres!');
            setSelectedRowIds([]);
        } catch (error) {
            console.error(error);
            toast.error('A tömeges törlés sikertelen!');
        }
    }, [selectedRowIds, tableData, producersMutate]);

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
        [currentFilters, selectedRowIds, canReset, dataFiltered.length, filters, confirmDialog]
    );

    const columns: GridColDef[] = [
        { field: 'category', headerName: 'Category', filterable: false },
        {
            field: 'bio',
            headerName: '',
            width: 80,
            renderCell: (params) => <RenderCellBio params={params} />,
        },
        {
            field: 'name',
            headerName: 'Termelő',
            flex: 1,
            minWidth: 360,
            hideable: false,
            renderCell: (params) => (
                <RenderCellName
                    params={params}
                    href={paths.dashboard.producer.edit(params.row.slug)}
                />
            ),
        },
        {
            field: 'producingTags',
            headerName: 'Mit termel?',
            width: 460,
            renderCell: (params) => <RenderCellProducingTags params={params} />,
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
                    key={`edit-${params.row.id}`}
                    icon={<Iconify icon="solar:pen-bold" />}
                    label="Szerkesztés"
                    href={paths.dashboard.producer.edit(params.row.slug)}
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
                    heading="Termelők"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Termelők', href: paths.dashboard.producer.root },
                        { name: 'Lista' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.producer.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új termelő
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
                        loading={producersLoading}
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
                                <EmptyContent title="Nincsenek megjeleníthető elemek" />
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
    filters: UseSetStateReturn<IProducerTableFilters>;
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
                <ProducerTableToolbar filters={filters} options={{ bios: BIO_OPTIONS }} />
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
                    <GridToolbarExport />
                </Box>
            </GridToolbarContainer>
            {canReset && (
                <ProducerTableFiltersResult
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
    inputData: IProducerItem[];
    filters: IProducerTableFilters;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
    const { bio } = filters;

    if (bio.length) {
        inputData = inputData.filter((producer) => bio.includes(producer.bio.toString()));
    }
    return inputData;
}
