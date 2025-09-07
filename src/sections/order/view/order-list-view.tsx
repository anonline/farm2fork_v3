'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IOrderItem, IOrderTableFilters } from 'src/types/order';

import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
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

import { fIsAfter, fIsBetween } from 'src/utils/format-time';
import { transformOrdersDataToTableItems } from 'src/utils/transform-order-data';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import { useGetOrders } from 'src/actions/order';
import { deleteOrder, deleteOrders } from 'src/actions/order-management';
import { OrderTableRow } from '../order-table-row';
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from '../order-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
    { value: 'all', label: 'Összes' },
    { value: 'pending', label: 'Függőben' },
    { value: 'inprogress', label: 'Feldolgozás alatt' },
    { value: 'completed', label: 'Teljesítve' },
    { value: 'cancelled', label: 'Visszamondva' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'orderNumber', label: 'ID', width: 88 },
    { id: 'status', label: '', width: 110 },
    { id: 'name', label: 'Vásárló' },
    { id: 'totalQuantity', label: '', width: 120, align: 'center' },
    { id: 'totalnetAmount', label: 'Nettó összeg', width: 140 },
    { id: 'totalAmount', label: 'Br. összeg', width: 140 },
    { id: 'createdAt', label: 'Dátum', width: 140 },
    { id: 'delivery', label: 'Szállítási mód', width: 140 },
    { id: 'payment', label: 'Fizetési mód', width: 140 },
    { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function OrderListView() {
    const table = useTable({ defaultOrderBy: 'orderNumber' });

    const confirmDialog = useBoolean();

    const filters = useSetState<IOrderTableFilters>({
        name: '',
        status: 'all',
        startDate: null,
        endDate: null,
    });
    const { state: currentFilters, setState: updateFilters } = filters;

    // Fetch orders from database
    const { 
        orders: ordersData, 
        ordersLoading, 
        ordersError, 
        refreshOrders 
    } = useGetOrders({
        status: currentFilters.status !== 'all' ? currentFilters.status : undefined,
    });

    // Transform orders data to table format
    const [tableData, setTableData] = useState<IOrderItem[]>([]);

    useEffect(() => {
        const loadTransformedData = async () => {
            if (ordersData) {
                const transformedData = await transformOrdersDataToTableItems(ordersData);
                setTableData(transformedData);
            }
        };

        loadTransformedData();
    }, [ordersData]);

    const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: currentFilters,
        dateError,
    });

    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

    const canReset =
        !!currentFilters.name ||
        currentFilters.status !== 'all' ||
        (!!currentFilters.startDate && !!currentFilters.endDate);

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
        },
        [updateFilters, table]
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Delete"
            content={
                <>
                    Are you sure want to delete <strong> {table.selected.length} </strong> items?
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
                    Delete
                </Button>
            }
        />
    );

    return (
        <>
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Összes rendelés"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Rendelések', href: paths.dashboard.order.root },
                        { name: 'Lista' },
                    ]}
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
                                            (tab.value === 'completed' && 'success') ||
                                            (tab.value === 'pending' && 'warning') ||
                                            (tab.value === 'inprogress' && 'info') ||
                                            (tab.value === 'cancelled' && 'error') ||
                                            'default'
                                        }
                                    >
                                        {[
                                            'completed',
                                            'pending',
                                            'cancelled',
                                            'refunded',
                                            'inprogress',
                                            'deleted',
                                        ].includes(tab.value)
                                            ? tableData.filter((user) => user.status === tab.value)
                                                  .length
                                            : tableData.length}
                                    </Label>
                                }
                            />
                        ))}
                    </Tabs>

                    <OrderTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        dateError={dateError}
                    />

                    {canReset && (
                        <OrderTableFiltersResult
                            filters={filters}
                            totalResults={dataFiltered.length}
                            onResetPage={table.onResetPage}
                            sx={{ p: 2.5, pt: 0 }}
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
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={confirmDialog.onTrue}>
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                </Tooltip>
                            }
                        />

                        <Scrollbar sx={{ minHeight: 444 }}>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
    const { status, name, startDate, endDate } = filters;

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
                field?.toLowerCase().includes(name.toLowerCase())
            )
        );
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
