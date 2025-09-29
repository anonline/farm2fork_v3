'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IUserItem, IUserTableFilters } from 'src/types/user';

import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _roles, USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
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

import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { getUsers } from 'src/actions/user-management';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TAB_OPTIONS = [
    { value: 'all', label: 'Összes' },
    { value: 'corp', label: 'Céges' },
    { value: 'vip', label: 'VIP' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Magányszemély' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'name', label: 'Név' },
    { id: 'discount', label: 'Kedvezmény (%)', width: 150, align: 'center' },
    { id: 'role', label: 'Jogosultság', width: 180, align: 'center' },
    { id: 'status', label: 'Hírlevél', width: 100, align: 'center' },
    { id: 'phoneNumber', label: 'Honnan hallott rólunk?', width: 250 },
    { id: '', width: 88 },
];

// ----------------------------------------------------------------------
type Props = {
    _userList: IUserItem[];
};

export function UserListView(usersData: Readonly<Props>) {
    
    const table = useTable();
    const _userList = usersData._userList;

    const confirmDialog = useBoolean();

    const [tableData, setTableData] = useState<IUserItem[]>(_userList);

    const filters = useSetState<IUserTableFilters>({ name: '', role: [], status: 'all', roleTab: 'all' });
    const { state: currentFilters, setState: updateFilters } = filters;

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: currentFilters,
    });

    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

    const canReset =
        !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all' || currentFilters.roleTab !== 'all';

    const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

    const handleDeleteRow = useCallback(
        (id: string) => {
            const deleteRow = tableData.filter((row) => row.id !== id);

            toast.success('Törlés sikeres!');

            setTableData(deleteRow);

            table.onUpdatePageDeleteRow(dataInPage.length);
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

        toast.success('Törlés sikeres!');

        setTableData(deleteRows);

        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleFilterRoleTab = useCallback(
        (event: React.SyntheticEvent, newValue: string) => {
            table.onResetPage();
            updateFilters({ roleTab: newValue });
        },
        [updateFilters, table]
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content={
                <>
                    Biztosan törölni akarja a kijelölt <strong> {table.selected.length} </strong> felhasználót?
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
                    heading="Felhasználók"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Felhasználók', href: paths.dashboard.user.root },
                        { name: 'Lista' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.user.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új felhasználó
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <Tabs
                        value={currentFilters.roleTab}
                        onChange={handleFilterRoleTab}
                        sx={[
                            (theme) => ({
                                px: 2.5,
                                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                            }),
                        ]}
                    >
                        {TAB_OPTIONS.map((tab) => (
                            <Tab
                                key={tab.value}
                                iconPosition="end"
                                value={tab.value}
                                label={tab.label}
                                icon={
                                    <Label
                                        variant={
                                            ((tab.value === 'all' ||
                                                tab.value === currentFilters.roleTab) &&
                                                'filled') ||
                                            'soft'
                                        }
                                        color={
                                            (tab.value === 'corp' && 'success') ||
                                            (tab.value === 'vip' && 'warning') ||
                                            (tab.value === 'admin' && 'error') ||
                                            'default'
                                        }
                                    >
                                        {['corp', 'vip', 'admin', 'user'].includes(
                                            tab.value
                                        )
                                            ? tableData.filter((user) => {
                                                switch (tab.value) {
                                                    case 'corp':
                                                        return user.role.is_corp;
                                                    case 'vip':
                                                        return user.role.is_vip;
                                                    case 'admin':
                                                        return user.role.is_admin;
                                                    default:
                                                        return !(user.role.is_admin || user.role.is_vip || user.role.is_corp);
                                                }
                                            })
                                                  .length
                                            : tableData.length}
                                    </Label>
                                }
                            />
                        ))}
                    </Tabs>

                    <UserTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        options={{ roles: _roles }}
                    />

                    {canReset && (
                        <UserTableFiltersResult
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

                        <Scrollbar>
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
                                            <UserTableRow
                                                key={row.id}
                                                row={row}
                                                selected={table.selected.includes(row.id)}
                                                onSelectRow={() => table.onSelectRow(row.id)}
                                                onDeleteRow={() => handleDeleteRow(row.id)}
                                                editHref={paths.dashboard.user.edit(row.id)}
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
            </DashboardContent>

            {renderConfirmDialog()}
        </>
    );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
    inputData: IUserItem[];
    filters: IUserTableFilters;
    comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
    const { name, role, roleTab } = filters;

    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (name) {
        inputData = inputData.filter((user) =>
            user.name.toLowerCase().includes(name.toLowerCase()) ||
            user.email.toLowerCase().includes(name.toLowerCase()) ||
            (user.customerData?.discountPercent && user.customerData.discountPercent.toString().includes(name))
        );
    }

    if (roleTab !== 'all') {
        inputData = inputData.filter((user) => {
            switch (filters.roleTab) {
                case 'corp':
                    return user.role.is_corp;
                case 'vip':
                    return user.role.is_vip;
                case 'admin':
                    return user.role.is_admin;
                default:
                    return !(user.role.is_admin || user.role.is_vip || user.role.is_corp);
            }
        });
    }

    if (role.length) {
        inputData = inputData.filter((user) => {
            return role.map((roleFilter) => {
                switch (roleFilter) {
                    case 'Admin':
                        return user.role.is_admin;
                    case 'VIP':
                        return user.role.is_vip;
                    case 'Céges':
                        return user.role.is_corp;
                    default:
                        return !(user.role.is_admin || user.role.is_vip || user.role.is_corp);
                }
            }).find((roleMatch) => roleMatch === true);
        });
    }

    return inputData;
}
