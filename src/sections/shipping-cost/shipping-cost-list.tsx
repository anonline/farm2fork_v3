'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { IShippingCostMethod } from 'src/types/shipping-cost';

import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Box,
    Card,
    Chip,
    Stack,
    Button,
    Dialog,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fPercent, fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { createShippingCostMethod, updateShippingCostMethod, deleteShippingCostMethod, useGetShippingCostMethods } from 'src/actions/shipping-cost';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------


export default function ShippingCostList() {
    const { methods: shippingMethods, methodsLoading, methodsMutate } = useGetShippingCostMethods();
    
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [editingMethod, setEditingMethod] = useState<IShippingCostMethod | null>(null);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const defaultValues = useMemo(() => ({
        name: '',
        enabledPublic: true,
        enabledVIP: true,
        enabledCompany: true,
        netCostPublic: 0,
        netCostVIP: 0,
        netCostCompany: 0,
        vat: 27,
        vatPublic: true,
        vatVIP: true,
        vatCompany: true,
        freeLimit: 0,
    }), []);

    const rhfMethods = useForm<ShippingCostSchemaType>({
        resolver: zodResolver(ShippingCostSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState: { isSubmitting } } = rhfMethods;

    const handleOpenNew = () => {
        reset(defaultValues);
        setEditingMethod(null);
        setOpenFormDialog(true);
    };

    const handleOpenEdit = (row: IShippingCostMethod) => {
        reset(row);
        setEditingMethod(row);
        setOpenFormDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenFormDialog(false);
        setEditingMethod(null);
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (editingMethod) { 
                await updateShippingCostMethod(editingMethod.id, data);
                toast.success('Sikeres mentés!');
            } else { 
                await createShippingCostMethod(data);
                toast.success('Sikeres létrehozás!');
            }
            methodsMutate();
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    });

    const handleDelete = async () => {
        if (!editingMethod) return;
        try {
            await deleteShippingCostMethod(editingMethod.id);
            toast.success('Sikeresen törölve!');
            methodsMutate();
            setOpenDeleteConfirm(false);
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const columns: GridColDef<IShippingCostMethod>[] = [
        { 
            field: 'name', 
            headerName: 'Név', 
            flex: 1, 
            minWidth: 180 
        },
        { 
            field: 'enabledPublic', 
            headerName: 'Publikus', 
            width: 100, 
            align: 'center', 
            headerAlign: 'center', 
            renderCell: (params) => <RenderCellBoolean value={params.value} /> 
        },
        { 
            field: 'enabledVIP', 
            headerName: 'VIP', 
            width: 100, 
            align: 'center', 
            headerAlign: 'center', 
            renderCell: (params) => <RenderCellBoolean value={params.value} /> 
        },
        { 
            field: 'enabledCompany', 
            headerName: 'Céges', 
            width: 100, 
            align: 'center', 
            headerAlign: 'center', 
            renderCell: (params) => <RenderCellBoolean value={params.value} /> 
        },
        { 
            field: 'netCostPublic', 
            headerName: 'Nettó ár (Publikus)', 
            width: 160, align: 'right', 
            headerAlign: 'right', 
            renderCell: (params) => fCurrency(params.value) 
        },
        { 
            field: 'netCostVIP', 
            headerName: 'Nettó ár (VIP)', 
            width: 160, 
            align: 'right', 
            headerAlign: 'right', 
            renderCell: (params) => fCurrency(params.value) 
        },
        { 
            field: 'netCostCompany', 
            headerName: 'Nettó ár (Céges)', 
            width: 160, align: 'right', 
            headerAlign: 'right', 
            renderCell: (params) => fCurrency(params.value) 
        },
        { 
            field: 'vat', 
            headerName: 'ÁFA', 
            width: 100, 
            align: 'right', 
            headerAlign: 'right', 
            renderCell: (params) => fPercent(params.value) 
        },
        { 
            field: 'freeLimit', 
            headerName: 'Ingyenes határ', 
            width: 150, 
            align: 'right', 
            headerAlign: 'right', 
            renderCell: (params) => fCurrency(params.value) 
        },
        {
            field: 'actions', 
            type: 'actions', 
            headerName: '', 
            width: 80, 
            align: 'right',
            getActions: ({ row }) => [
                <GridActionsCellItem 
                key="edit" 
                icon={<Iconify icon="solar:pen-bold" />} 
                label="Szerkesztés" 
                onClick={() => handleOpenEdit(row)} />,
            ],
        },
    ];

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Szállítási Költségek"
                links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Szállítási Költségek' }]}
                action={
                    <Button onClick={handleOpenNew} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        Új metódus
                    </Button>
                }
            />
            <Card sx={{ mt: 5 }}>
                <DataGrid
                    rows={shippingMethods}
                    columns={columns}
                    loading={methodsLoading}
                    autoHeight
                    disableRowSelectionOnClick
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[5, 10, 25]}
                />
            </Card>

            <Dialog open={openFormDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{editingMethod ? `"${editingMethod.name}" szerkesztése` : 'Új metódus létrehozása'}</DialogTitle>
                <FormProvider {...rhfMethods}>
                    <form onSubmit={onSubmit}>
                        <DialogContent>
                            <Stack spacing={3} sx={{ pt: 1 }}>
                                <RHFTextField name="name" label="Név" />
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} gap={2}>
                                    <RHFTextField name="netCostPublic" label="Nettó ár (Publikus)" type="number" />
                                    <RHFTextField name="netCostVIP" label="Nettó ár (VIP)" type="number" />
                                    <RHFTextField name="netCostCompany" label="Nettó ár (Céges)" type="number" />
                                </Box>
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
                                    <RHFTextField name="vat" label="ÁFA (%)" type="number" />
                                    <RHFTextField name="freeLimit" label="Ingyenes szállítási határ (nettó)" type="number" />
                                </Box>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-around" sx={{ p: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                    <RHFSwitch name="enabledPublic" label="Publikus engedélyezve" />
                                    <RHFSwitch name="enabledVIP" label="VIP engedélyezve" />
                                    <RHFSwitch name="enabledCompany" label="Céges engedélyezve" />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-around" sx={{ p: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                    <RHFSwitch name="vatPublic" label="ÁFA-s (Publikus)" />
                                    <RHFSwitch name="vatVIP" label="ÁFA-s (VIP)" />
                                    <RHFSwitch name="vatCompany" label="ÁFA-s (Céges)" />
                                </Stack>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            {editingMethod && (
                                <Button onClick={() => setOpenDeleteConfirm(true)} color="error" variant="outlined">
                                    Törlés
                                </Button>
                            )}
                            <Box sx={{ flexGrow: 1 }} />
                            <Button onClick={handleCloseDialog} color="inherit">Mégse</Button>
                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {editingMethod ? 'Mentés' : 'Létrehozás'}
                            </LoadingButton>
                        </DialogActions>
                    </form>
                </FormProvider>
            </Dialog>

            <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogTitle>Törlés Megerősítése</DialogTitle>
                <DialogContent>
                    <Typography>
                        Biztosan törölni szeretnéd a(z) <strong>{editingMethod?.name}</strong> szállítási metódust?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="inherit">Mégse</Button>
                    <Button onClick={handleDelete} color="error">Törlés</Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}


// ----------------------------------------------------------------------


const ShippingCostSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező' }),
    enabledPublic: zod.boolean(),
    enabledVIP: zod.boolean(),
    enabledCompany: zod.boolean(),
    netCostPublic: zod.coerce.number().min(0, { message: 'Az ár nem lehet negatív' }),
    netCostVIP: zod.coerce.number().min(0, { message: 'Az ár nem lehet negatív' }),
    netCostCompany: zod.coerce.number().min(0, { message: 'Az ár nem lehet negatív' }),
    vat: zod.coerce.number().min(0, { message: 'Az ÁFA nem lehet negatív' }).max(100, { message: 'Az ÁFA nem lehet több, mint 100' }),
    vatPublic: zod.boolean(),
    vatVIP: zod.boolean(),
    vatCompany: zod.boolean(),
    freeLimit: zod.coerce.number().min(0, { message: 'A limit nem lehet negatív' }),
}).refine((data) => {
    if (data.enabledPublic && data.netCostPublic <= 0) {
        return false;
    }
    return true;
}, {
    message: 'Ha a publikus szállítás engedélyezve van, az ára nem lehet 0!',
    path: ['netCostPublic'],
}).refine((data) => {
    if (data.enabledVIP && data.netCostVIP <= 0) {
        return false;
    }
    return true;
}, {
    message: 'Ha a VIP szállítás engedélyezve van, az ára nem lehet 0!',
    path: ['netCostVIP'],
}).refine((data) => {
    if (data.enabledCompany && data.netCostCompany <= 0) {
        return false;
    }
    return true;
}, {
    message: 'Ha a céges szállítás engedélyezve van, az ára nem lehet 0!',
    path: ['netCostCompany'],
});


type ShippingCostSchemaType = zod.infer<typeof ShippingCostSchema>;

function RenderCellBoolean({ value }: Readonly<{ value: boolean }>) {
    return (
        <Chip
            icon={
                <Iconify
                    icon={value ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                />
            }
            color={value ? 'success' : 'error'}
            size="small"
            sx={{
                height: '24px',
                width: '24px',
                pl: 1.89,
                '& .MuiChip-icon': {
                    m: 0,
                },
            }}
        />
    );
}