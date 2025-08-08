'use client';

import type { ICategory } from 'src/types/article';
import type {
    GridRowId,
    GridColDef,
    GridRowModesModel,
    GridRowSelectionModel} from '@mui/x-data-grid';

import { useSWRConfig } from 'swr';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {
    DataGrid,
    GridRowModes,
    GridActionsCellItem,
    GridToolbarContainer,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';

import {
    createArticleCategory,
    updateArticleCategory,
    useGetArticleCategories,
    deleteArticleCategories
} from 'src/actions/article-categories';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

function CustomToolbar({ selectedRowCount, onBulkDeleteClick }: Readonly<{ selectedRowCount: number, onBulkDeleteClick: () => void }>) {
    return (
        <GridToolbarContainer>
            <Box sx={{ flexGrow: 1, p: '0px 8px', height: '48px', display: 'flex', alignItems: 'center' }}>
                <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onBulkDeleteClick}
                    sx={{ visibility: selectedRowCount > 0 ? 'visible' : 'hidden' }}
                >
                    {selectedRowCount} elem törlése
                </Button>
            </Box>
        </GridToolbarContainer>
    );
}


export default function CategoryListView() {
    const { categories, categoriesLoading } = useGetArticleCategories();
    const { mutate } = useSWRConfig();

    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [openNewCategoryDialog, setOpenNewCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);

    const addNewCategory = async () => {
        if (newCategoryName.trim() === '') {
            // MÓDOSÍTÁS: A 'return' eltávolítva a toast elől, és külön sorba került.
            toast.error('A kategória neve nem lehet üres!');
            return;
        }
        try {
            await createArticleCategory(newCategoryName);
            toast.success('Kategória sikeresen hozzáadva!');
            mutate('articleCategories');
            setNewCategoryName('');
            setOpenNewCategoryDialog(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const confirmBulkDelete = async () => {
        try {
            await deleteArticleCategories(selectedRowIds as number[]);
            toast.success(`${selectedRowIds.length} elem sikeresen törölve!`);
            mutate('articleCategories');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setOpenBulkDeleteConfirm(false);
            setSelectedRowIds([]);
        }
    };

    const processRowUpdate = async (newRow: ICategory, oldRow: ICategory) => {
        try {
            const updated = await updateArticleCategory(newRow.id, newRow.title);
            toast.success('Sikeres frissítés!');
            return { ...updated, articleCount: oldRow.articleCount };
        } catch (error: any) {
            toast.error(error.message);
            return oldRow;
        }
    };

    const handleEditClick = (id: GridRowId) => () => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    const handleSaveClick = (id: GridRowId) => () => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const handleCancelClick = (id: GridRowId) => () => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Kategória neve',
            flex: 1,
            editable: true,
            disableColumnMenu: true,
        },
        { 
            field: 'articleCount', 
            headerName: 'Cikkek száma', 
            width: 150, 
            align: 'center', 
            headerAlign: 'center',
            disableColumnMenu: true,
            editable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 100,
            align: 'right',
            headerAlign: 'right',
            disableColumnMenu: true,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem key="save" icon={<Iconify icon="solar:check-circle-bold" />} label="Mentés" onClick={handleSaveClick(id)} color="primary" />,
                        <GridActionsCellItem key="cancel" icon={<Iconify icon="solar:close-circle-bold" />} label="Mégse" onClick={handleCancelClick(id)} />,
                    ];
                }
                return [
                    <GridActionsCellItem key="edit" icon={<Iconify icon="solar:pen-bold" />} label="Szerkesztés" onClick={handleEditClick(id)} />
                ];
            },
        },
    ];

    const MemoizedToolbar = useCallback(
        () => (
            <CustomToolbar
                selectedRowCount={selectedRowIds.length}
                onBulkDeleteClick={() => setOpenBulkDeleteConfirm(true)}
            />
        ),
        [selectedRowIds.length]
    );

    return (
        <Container>
            <CustomBreadcrumbs
                heading="Kategóriák"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Hírek', href: paths.dashboard.post.root },
                    { name: 'Kategóriák' },
                ]}
                action={
                    <Button onClick={() => setOpenNewCategoryDialog(true)} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        Új kategória
                    </Button>
                }
            />
            
            <Card sx={{ mt: 5 }}>
                <Box sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={categories}
                        columns={columns}
                        loading={categoriesLoading}
                        checkboxSelection
                        disableRowSelectionOnClick
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={(error) => toast.error(error.message)}
                        onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                        rowSelectionModel={selectedRowIds}
                        slots={{
                            toolbar: MemoizedToolbar,
                        }}
                    />
                </Box>
            </Card>

            <Dialog open={openNewCategoryDialog} onClose={() => setOpenNewCategoryDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Új kategória hozzáadása</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        margin="dense"
                        label="Kategória neve"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        variant="outlined"
                        onKeyDown={(e) => e.key === 'Enter' && addNewCategory()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewCategoryDialog(false)} color="inherit">Mégse</Button>
                    <Button onClick={addNewCategory} variant="contained">Hozzáadás</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBulkDeleteConfirm} onClose={() => setOpenBulkDeleteConfirm(false)}>
                <DialogTitle>Törlés Megerősítése</DialogTitle>
                <DialogContent>
                    <Typography>
                        Biztosan törölni szeretnéd a kiválasztott <strong>{selectedRowIds.length}</strong> elemet?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkDeleteConfirm(false)} color="inherit">Mégse</Button>
                    <Button onClick={confirmBulkDelete} color="error" variant="contained">Törlés</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}