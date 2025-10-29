'use client';

import type { ITranslation, ITranslationRow, ITranslationTableFilters } from 'src/types/translation';

import { useMemo, useState, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { languages } from 'src/locales/locales-config';
import { DashboardContent } from 'src/layouts/dashboard';
import { updateTranslation, deleteTranslation } from 'src/actions/translation-management';

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
    TableEmptyRows,
    TableHeadCustom,
    TablePaginationCustom,
} from 'src/components/table';

import { TranslationNewDialog } from '../translation-new-dialog';
import { TranslationTableToolbar } from '../translation-table-toolbar';

// ----------------------------------------------------------------------

type Props = Readonly<{
    translations: ITranslation[];
}>;

export function TranslationListView({ translations }: Props) {
    const table = useTable({ defaultOrderBy: 'key', defaultRowsPerPage: 25 });
    const confirmDialog = useBoolean();
    const newDialog = useBoolean();

    const [tableData, setTableData] = useState<ITranslation[]>(translations);
    const [editingCell, setEditingCell] = useState<{ translationId: number; lang: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ namespace: string; key: string } | null>(null);

    const filters = useSetState<ITranslationTableFilters>({ searchTerm: '' });
    const { state: currentFilters } = filters;

    // Transform flat translations into row format
    const transformedData = useMemo(() => {
        const grouped = new Map<string, ITranslationRow>();

        for (const trans of tableData) {
            const rowKey = `${trans.namespace}.${trans.key}`;
            
            if (!grouped.has(rowKey)) {
                grouped.set(rowKey, {
                    id: trans.id,
                    namespace: trans.namespace,
                    key: trans.key,
                });
            }

            const row = grouped.get(rowKey)!;
            row[trans.language] = {
                id: trans.id,
                value: trans.value,
            };
        }

        return Array.from(grouped.values());
    }, [tableData]);

    // Apply filters and sorting
    const dataFiltered = useMemo(() => {
        let filtered = transformedData;

        // Search filter
        if (currentFilters.searchTerm) {
            const searchLower = currentFilters.searchTerm.toLowerCase();
            filtered = filtered.filter((row) => {
                const namespaceMatch = row.namespace.toLowerCase().includes(searchLower);
                const keyMatch = row.key.toLowerCase().includes(searchLower);
                
                // Search in all language values
                const valueMatch = languages.some((lang) => {
                    const langData = row[lang];
                    return langData?.value?.toLowerCase().includes(searchLower);
                });

                return namespaceMatch || keyMatch || valueMatch;
            });
        }

        // Apply sorting
        if (table.orderBy) {
            filtered = [...filtered].sort((a, b) => {
                let aVal: any;
                let bVal: any;

                if (table.orderBy === 'key') {
                    aVal = `${a.namespace}.${a.key}`;
                    bVal = `${b.namespace}.${b.key}`;
                } else if (languages.includes(table.orderBy)) {
                    aVal = a[table.orderBy]?.value || '';
                    bVal = b[table.orderBy]?.value || '';
                } else {
                    aVal = a[table.orderBy as keyof ITranslationRow];
                    bVal = b[table.orderBy as keyof ITranslationRow];
                }

                if (table.order === 'asc') {
                    return aVal > bVal ? 1 : -1;
                }
                return aVal < bVal ? 1 : -1;
            });
        }

        return filtered;
    }, [transformedData, currentFilters, table.order, table.orderBy]);

    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
    const notFound = !dataFiltered.length;
    const canReset = !!currentFilters.searchTerm;

    // Create table head with dynamic language columns
    const TABLE_HEAD = useMemo(() => {
        const baseColumns = [
            { id: 'key', label: 'Kulcs (Namespace.Key)', width: 300 },
        ];

        const langColumns = languages.map((lang) => ({
            id: lang,
            label: lang.toUpperCase(),
            minWidth: 200,
        }));

        return [...baseColumns, ...langColumns, { id: 'actions', label: '', width: 88 }];
    }, []);

    const handleEditCell = useCallback((translationId: number, lang: string, currentValue: string) => {
        setEditingCell({ translationId, lang });
        setEditValue(currentValue);
    }, []);

    const handleSaveCell = useCallback(async (translationId: number, lang: string) => {
        try {
            await updateTranslation({
                id: translationId,
                language: lang,
                value: editValue,
            });

            // Update local state
            setTableData((prev) =>
                prev.map((trans) =>
                    trans.id === translationId ? { ...trans, value: editValue } : trans
                )
            );

            toast.success('Fordítás frissítve!');
            setEditingCell(null);
        } catch (error) {
            console.error('Error saving translation:', error);
            toast.error('Hiba történt a mentés során!');
        }
    }, [editValue]);

    const handleCancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    const handleDeleteRow = useCallback((namespace: string, key: string) => {
        setDeleteTarget({ namespace, key });
        confirmDialog.onTrue();
    }, [confirmDialog]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        try {
            await deleteTranslation(deleteTarget.namespace, deleteTarget.key);

            // Update local state
            setTableData((prev) =>
                prev.filter(
                    (trans) =>
                        !(trans.namespace === deleteTarget.namespace && trans.key === deleteTarget.key)
                )
            );

            toast.success('Fordítás törölve!');
            confirmDialog.onFalse();
            setDeleteTarget(null);
        } catch (error) {
            console.error('Error deleting translation:', error);
            toast.error('Hiba történt a törlés során!');
        }
    }, [deleteTarget, confirmDialog]);

    const handleNewTranslation = useCallback((newTranslations: ITranslation[]) => {
        setTableData((prev) => [...prev, ...newTranslations]);
    }, []);

    return (
        <>
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Statikus fordítások"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Statikus fordítások' },
                    ]}
                    action={
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={newDialog.onTrue}
                        >
                            Új fordítási kulcs
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <TranslationTableToolbar
                        filters={filters}
                        onResetPage={table.onResetPage}
                        canReset={canReset}
                    />

                    <Scrollbar>
                        <Table size="medium" sx={{ minWidth: 960 }}>
                            <TableHeadCustom
                                order={table.order}
                                orderBy={table.orderBy}
                                headCells={TABLE_HEAD}
                                onSort={table.onSort}
                            />

                            <TableBody>
                                {dataInPage.map((row) => (
                                    <TableRow hover key={`${row.namespace}.${row.key}`}>
                                        <TableCell>
                                            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                {row.namespace}.{row.key}
                                            </Box>
                                        </TableCell>

                                        {languages.map((lang) => {
                                            const langData = row[lang];
                                            const isEditing =
                                                editingCell?.translationId === langData?.id &&
                                                editingCell?.lang === lang;

                                            return (
                                                <TableCell key={lang}>
                                                    {isEditing ? (
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() =>
                                                                handleSaveCell(langData.id, lang)
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSaveCell(langData.id, lang);
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelEdit();
                                                                }
                                                            }}
                                                            autoFocus
                                                            slotProps={{
                                                                input: {
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() =>
                                                                                    handleSaveCell(
                                                                                        langData.id,
                                                                                        lang
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Iconify icon="eva:checkmark-fill" />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={handleCancelEdit}
                                                                            >
                                                                                <Iconify icon="mingcute:close-line" />
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    ),
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            onClick={() =>
                                                                handleEditCell(
                                                                    langData?.id || 0,
                                                                    lang,
                                                                    langData?.value || ''
                                                                )
                                                            }
                                                            sx={{
                                                                cursor: 'pointer',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                minHeight: 40,
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover',
                                                                },
                                                            }}
                                                        >
                                                            {langData?.value || '—'}
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell align="right">
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleDeleteRow(row.namespace, row.key)
                                                }
                                            >
                                                <Iconify icon="solar:trash-bin-trash-bold" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                <TableEmptyRows
                                    height={56}
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

            <ConfirmDialog
                open={confirmDialog.value}
                onClose={confirmDialog.onFalse}
                title="Törlés"
                content="Biztosan törölni akarja ezt a fordítási kulcsot az összes nyelvből?"
                action={
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                        Törlés
                    </Button>
                }
            />

            <TranslationNewDialog
                open={newDialog.value}
                onClose={newDialog.onFalse}
                onCreate={handleNewTranslation}
            />
        </>
    );
}
