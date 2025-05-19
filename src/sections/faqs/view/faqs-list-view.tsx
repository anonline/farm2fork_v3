'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IFaqItem, IFaqCategoryItem, IFaqTableFilters } from 'src/types/faq';

import { useState, useCallback } from 'react';
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

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ORDER_STATUS_OPTIONS } from 'src/_mock';
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

import { FaqTableRow } from '../faqs-table-row';
import { FaqTableToolbar } from '../faqs-table-toolbar';
//import { OrderTableFiltersResult } from '../order-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Összes' }, ...ORDER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
    //{ id: 'id', label: 'ID', width: 10 },
    { id: 'category', label: 'Kategória', width: 30 },
    { id: 'question', label: 'Kérdés', width: 450 },
    { id: '', width: 88 },
];

// ----------------------------------------------------------------------

type FaqListViewProps = {
    faqList: IFaqItem[];
    faqCategories: IFaqCategoryItem[] | undefined;
};

export function FaqListView({faqList, faqCategories}: Readonly<FaqListViewProps>) {
    const table = useTable({ defaultOrderBy: 'id' });

    const confirmDialog = useBoolean();
    
    const [tableData, setTableData] = useState<IFaqItem[]>(faqList);

    const filters = useSetState<IFaqTableFilters>({
        question: '',
        categoryId: null,
    });
    const { state: currentFilters, setState: updateFilters } = filters;

   const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: currentFilters
    });
    
    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

    const canReset = !!currentFilters.question;

    const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

    const handleDeleteRow = useCallback(
        (id: number) => {
            const deleteRow = tableData.filter((row) => row.id !== id);

            toast.success('Sikeres törlés!');

            setTableData(deleteRow);

            table.onUpdatePageDeleteRow(dataInPage.length);
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));

        toast.success('Törlések sikeresek!');

        setTableData(deleteRows);

        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleFilterStatus = useCallback(
        (event: React.SyntheticEvent, newValue: number) => {
            table.onResetPage();
            updateFilters({ categoryId: newValue });
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
                    heading="Összes gyakran feltett kérdés"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Gyakran feltett kérdések', href: paths.dashboard.order.root },
                        { name: 'Összes' },
                    ]}
                    action={<>
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.faqs.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új kérdés
                        </Button>
                        <Button
                            component={RouterLink}
                            href={paths.faqs}
                            target='_blank'
                            variant="contained"
                            color='primary'
                            startIcon={<Iconify icon="eva:external-link-fill" />}
                        >
                            Oldal megtekintése
                        </Button>
                        </>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <Tabs
                        value={currentFilters.categoryId?.valueOf()}
                        onChange={handleFilterStatus}
                        sx={[
                            (theme) => ({
                                px: 2.5,
                                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                            }),
                        ]}
                    >
                        {faqCategories?.map((tab) => (
                            <Tab
                                key={tab.id}
                                iconPosition="end"
                                value={tab.id}
                                label={tab.name}
                                icon={
                                    <Label
                                        variant={
                                            ((tab.id === currentFilters.categoryId) &&
                                                'filled') ||
                                            'soft'
                                        }
                                        color="default"
                                    >
                                        {
                                        faqCategories.map((category)=> category.id.toString())
                                            .includes(tab.id.toString())
                                                ? tableData.filter((faq) => faq.faqCategoryId === tab.id || tab.id === -1).length
                                                : tableData.length
                                        }
                                    </Label>
                                }
                            />
                        ))}
                    </Tabs>

                    <FaqTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                    />

                    {/*canReset && (
                        <OrderTableFiltersResult
                            filters={filters}
                            totalResults={dataFiltered.length}
                            onResetPage={table.onResetPage}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )*/}

                    <Box sx={{ position: 'relative' }}>
                        <TableSelectedAction
                            dense={table.dense}
                            numSelected={table.selected.length}
                            rowCount={dataFiltered.length}
                            onSelectAllRows={(checked) =>
                                table.onSelectAllRows(
                                    checked,
                                    dataFiltered.map((row) => row.id.toString())
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
                                            dataFiltered.map((row) => row.id.toString())
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
                                            <FaqTableRow
                                                key={row.id}
                                                row={row}
                                                selected={table.selected.includes(row.id.toString())}
                                                onSelectRow={() => table.onSelectRow(row.id.toString())}
                                                onDeleteRow={() => handleDeleteRow(row.id)}
                                                detailsHref={paths.dashboard.faqs.edit(row.id)}
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
    inputData: IFaqItem[];
    filters: IFaqTableFilters;
    comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
    const { question, categoryId: category } = filters;

    if (category && category !== -1) {
        inputData = inputData.filter((faq) => faq.faqCategoryId  === category);
    }

    if (question) {
        inputData = inputData.filter((row) =>
            [row.question, row.answer].some((field) =>
                field?.toLowerCase().includes(question.toLowerCase())
            )
        );
    }

    return inputData;
}
