'use client';

import type {
    GridColDef,
    GridRowSelectionModel} from '@mui/x-data-grid';

import { useSWRConfig } from 'swr';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarContainer,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetDeliveries, deleteDeliveries } from 'src/actions/delivery';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

function CustomToolbar({ selectedRowCount, onBulkDeleteClick }: Readonly<{ selectedRowCount: number, onBulkDeleteClick: () => void }>) {
    return (
        <GridToolbarContainer>
            <Box sx={{ flexGrow: 1, p: '0px 8px', height: '48px', display: 'flex', alignItems: 'center' }}>
                {selectedRowCount > 0 && (
                    <Button
                        size="small"
                        color="error"
                        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                        onClick={onBulkDeleteClick}
                    >
                        {selectedRowCount} elem törlése
                    </Button>
                )}
            </Box>
        </GridToolbarContainer>
    );
}

export default function DeliveryListView() {
    const { deliveries, deliveriesLoading } = useGetDeliveries();
    const { mutate } = useSWRConfig();

    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);

    const confirmBulkDelete = async () => {
        try {
            await deleteDeliveries(selectedRowIds as number[]);
            toast.success(`${selectedRowIds.length} elem sikeresen törölve!`);
            mutate('deliveries');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setOpenBulkDeleteConfirm(false);
            setSelectedRowIds([]);
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Név', flex: 1, disableColumnMenu: true },
        { field: 'phone', headerName: 'Telefonszám', width: 200, disableColumnMenu: true },
        {
            field: 'actions', type: 'actions', headerName: '', width: 80, align: 'right',
            disableColumnMenu: true,
            getActions: ({ id }) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<Iconify icon="solar:pen-bold" />}
                    label="Szerkesztés"
                    onClick={() => {
                        const url = paths.dashboard.delivery.edit(id);
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                />,
            ],
        },
    ];

    const MemoizedToolbar = useCallback(
        () => <CustomToolbar selectedRowCount={selectedRowIds.length} onBulkDeleteClick={() => setOpenBulkDeleteConfirm(true)} />,
        [selectedRowIds.length]
    );

    return (
        <Container>
            <CustomBreadcrumbs
                heading="Futárok"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Futárok' },
                ]}
                action={
                    <Button component={RouterLink} href={paths.dashboard.delivery.new} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        Új futár
                    </Button>
                }
            />
            
            <Card sx={{ mt: 5 }}>
                <Box sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={deliveries}
                        columns={columns}
                        loading={deliveriesLoading}
                        checkboxSelection
                        disableRowSelectionOnClick
                        slots={{ toolbar: MemoizedToolbar }}
                        onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                        rowSelectionModel={selectedRowIds}
                    />
                </Box>
            </Card>

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