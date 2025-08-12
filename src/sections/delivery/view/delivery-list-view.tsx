'use client';

import type { IDeliveryPerson } from 'src/types/delivery';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import { useSWRConfig } from 'swr';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetDeliveries, deleteDeliveries } from 'src/actions/delivery';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------


export default function DeliveryListView() {
    const { deliveries, deliveriesLoading } = useGetDeliveries();
    const { mutate } = useSWRConfig();

    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);
    const [openSingleDeleteConfirm, setOpenSingleDeleteConfirm] = useState(false);
    const [deliveryToDelete, setDeliveryToDelete] = useState<IDeliveryPerson | null>(null);

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

    const handleSingleDeleteClick = (delivery: IDeliveryPerson) => {
        setDeliveryToDelete(delivery);
        setOpenSingleDeleteConfirm(true);
    };

    const confirmSingleDelete = async () => {
        if (!deliveryToDelete) return;
        try {
            await deleteDeliveries([deliveryToDelete.id]);
            toast.success(`'${deliveryToDelete.name}' sikeresen törölve!`);
            mutate('deliveries');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setOpenSingleDeleteConfirm(false);
            setDeliveryToDelete(null);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Név',
            flex: 1,
            disableColumnMenu: true,
            renderCell: (params) => (
                <RenderCellName
                    row={params.row}
                    href={paths.dashboard.delivery.edit(params.row.id)}
                />
            ),
        },
        {
            field: 'phone',
            headerName: 'Telefonszám',
            width: 200,
            disableColumnMenu: true,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" noWrap>
                        {formatPhoneNumber(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 80,
            align: 'right',
            disableColumnMenu: true,
            getActions: ({ id, row }) => [
                <GridActionsCellItem
                    key="edit"
                    showInMenu
                    icon={<Iconify icon="solar:pen-bold" />}
                    label="Szerkesztés"
                    onClick={() => {
                        const url = paths.dashboard.delivery.edit(id);
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                />,
                <GridActionsCellItem
                    key="delete"
                    showInMenu
                    icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    label="Törlés"
                    onClick={() => handleSingleDeleteClick(row)}
                    sx={{ color: 'error.main' }}
                />,
            ],
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
        <>
            <Container maxWidth={false}>
                <CustomBreadcrumbs
                    heading="Futárok"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Futárok' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.delivery.new}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}>
                            Új futár
                        </Button>
                    }
                />

                <Card sx={{ mt: 5 }}>
                    <DataGrid
                        rows={deliveries}
                        columns={columns}
                        loading={deliveriesLoading}
                        checkboxSelection
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 20, { value: -1, label: 'Mind' }]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        slots={{
                            toolbar: MemoizedToolbar,
                        }}
                        onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                        rowSelectionModel={selectedRowIds}
                    />
                </Card>
            </Container>

            <Dialog open={openSingleDeleteConfirm} onClose={() => setOpenSingleDeleteConfirm(false)}>
                <DialogTitle>Törlés Megerősítése</DialogTitle>
                <DialogContent>
                    <Typography>
                        Biztosan törölni szeretnéd a(z) <strong>{deliveryToDelete?.name}</strong> nevű futárt?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSingleDeleteConfirm(false)} color="inherit">Mégse</Button>
                    <Button onClick={confirmSingleDelete} color="error" variant="contained">Törlés</Button>
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
        </>
    );
}


const formatPhoneNumber = (value: string | number | null | undefined) => {
    if (!value) return '';
    const stringValue = String(value);
    const digits = stringValue.replace(/\D/g, '');

    if (digits.length === 0) return '';

    const numberSlice = digits.startsWith('36') ? digits.substring(2) : digits;

    let formatted = `+36 (${numberSlice.substring(0, 2)}`;

    if (numberSlice.length > 2) {
        formatted += `) ${numberSlice.substring(2, 5)}`;
    }
    if (numberSlice.length > 5) {
        formatted += ` ${numberSlice.substring(5, 9)}`;
    }
    return formatted;
};

function CustomToolbar({ selectedRowCount, onBulkDeleteClick }: Readonly<{ selectedRowCount: number, onBulkDeleteClick: () => void }>) {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter placeholder="Keresés..." />
            <Box sx={{ flexGrow: 1 }} />
            {selectedRowCount > 0 && (
                <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onBulkDeleteClick}
                    sx={{ mr: 1 }}
                >
                    {selectedRowCount} elem törlése
                </Button>
            )}
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
        </GridToolbarContainer>
    );
}

function RenderCellName({ row, href }: Readonly<{ row: { name: string }, href: string }>) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <ListItemText
                primary={
                    <Link
                        component={RouterLink}
                        href={href}
                        sx={{ color: 'text.primary', typography: 'body2' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.name}
                    </Link>
                }
                primaryTypographyProps={{
                    noWrap: true,
                    typography: 'subtitle2',
                }}
            />
        </Box>
    );
}