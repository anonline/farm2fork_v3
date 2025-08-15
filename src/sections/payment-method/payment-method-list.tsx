'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { IPaymentMethod } from 'src/types/payment-method';

import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Box,
    Card,
    Chip,
    Stack,
    Button,
    Dialog,
    Select,
    MenuItem,
    Typography,
    InputLabel,
    DialogTitle,
    FormControl,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod, useGetPaymentMethods } from 'src/actions/payment-method';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const PaymentMethodSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező' }),
    slug: zod.string().min(1, { message: 'Slug megadása kötelező' }),
    type: zod.enum(['cod', 'wire', 'online'], { required_error: 'Típus kiválasztása kötelező' }),
    additionalCost: zod.coerce.number().min(0, { message: 'Az ár nem lehet negatív' }),
    protected: zod.boolean(),
    enablePublic: zod.boolean(),
    enableVIP: zod.boolean(),
    enableCompany: zod.boolean(),
});

type PaymentMethodSchemaType = zod.infer<typeof PaymentMethodSchema>;

const TYPE_OPTIONS = [
    { value: 'cod', label: 'Utánvét (COD)' },
    { value: 'wire', label: 'Átutalás (Wire)' },
    { value: 'online', label: 'Online' },
];

function RenderCellBoolean({ value }: Readonly<{ value: boolean }>) {
    return <Chip
        icon={<Iconify icon={value ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} />}
        color={value ? 'success' : 'error'}
        size="small"
        sx={{
            width: '24px',
            '& .MuiChip-icon': {
                ml: 1.5
            }
        }}
    />;
}

export default function PaymentMethodList() {
    const { methods, methodsLoading, methodsMutate } = useGetPaymentMethods();

    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [editingMethod, setEditingMethod] = useState<IPaymentMethod | null>(null);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const defaultValues = useMemo(() => ({
        name: '',
        slug: '',
        type: 'online' as const,
        additionalCost: 0,
        protected: false,
        enablePublic: true,
        enableVIP: true,
        enableCompany: true,
    }), []);

    const rhfMethods = useForm<PaymentMethodSchemaType>({
        resolver: zodResolver(PaymentMethodSchema),
        defaultValues,
    });

    const { reset, control, handleSubmit, formState: { isSubmitting } } = rhfMethods;

    const handleOpenNew = () => {
        reset(defaultValues);
        setEditingMethod(null);
        setOpenFormDialog(true);
    };

    const handleOpenEdit = (row: IPaymentMethod) => {
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
                await updatePaymentMethod(editingMethod.id, data);
                toast.success('Sikeres mentés!');
            } else {
                await createPaymentMethod(data);
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
            await deletePaymentMethod(editingMethod.id);
            toast.success('Sikeresen törölve!');
            methodsMutate();
            setOpenDeleteConfirm(false);
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const columns: GridColDef<IPaymentMethod>[] = [
        {
            field: 'name',
            headerName: 'Név',
            flex: 1,
            minWidth: 180
        },
        {
            field: 'slug',
            headerName: 'Slug',
            width: 150
        },
        {
            field: 'type',
            headerName: 'Típus',
            width: 120
        },
        {
            field: 'additionalCost',
            headerName: 'Plusz költség',
            width: 150, align: 'right',
            headerAlign: 'right',
            renderCell: (params) => fCurrency(params.value)
        },
        {
            field: 'protected',
            headerName: 'Védett',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellBoolean value={params.value} />
        },
        {
            field: 'enablePublic',
            headerName: 'Publikus',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellBoolean value={params.value} />
        },
        {
            field: 'enableVIP',
            headerName: 'VIP',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellBoolean value={params.value} />
        },
        {
            field: 'enableCompany',
            headerName: 'Céges',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <RenderCellBoolean value={params.value} />
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
                    onClick={() => handleOpenEdit(row)} />
            ],
        },
    ];

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Fizetési Módok"
                links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Fizetési Módok' }]}
                action={<Button onClick={handleOpenNew} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>Új Fizetési Mód</Button>}
            />
            <Card sx={{ mt: 5 }}>
                <DataGrid
                    rows={methods}
                    columns={columns}
                    loading={methodsLoading}
                    autoHeight
                    disableRowSelectionOnClick
                    // MÓDOSÍTÁS: A lapozási beállítások frissítve
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Card>

            <Dialog open={openFormDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{editingMethod ? `"${editingMethod.name}" szerkesztése` : 'Új fizetési mód'}</DialogTitle>
                <FormProvider {...rhfMethods}>
                    <form onSubmit={onSubmit}>
                        <DialogContent>
                            <Stack spacing={3} sx={{ pt: 1 }}>
                                <RHFTextField name="name" label="Név" />
                                <RHFTextField name="slug" label="Slug" />
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl fullWidth error={!!error}>
                                            <InputLabel>Típus</InputLabel>
                                            <Select {...field} label="Típus">
                                                {TYPE_OPTIONS.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                                <RHFTextField name="additionalCost" label="Plusz költség" type="number" />
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <RHFSwitch name="protected" label="Védett" />
                                    <RHFSwitch name="enablePublic" label="Publikus" />
                                    <RHFSwitch name="enableVIP" label="VIP" />
                                    <RHFSwitch name="enableCompany" label="Céges" />
                                </Stack>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            {editingMethod && (
                                <Button onClick={() => setOpenDeleteConfirm(true)} color="error" variant="outlined" disabled={editingMethod.protected}>
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
                    <Typography>Biztosan törölni szeretnéd a(z) <strong>{editingMethod?.name}</strong> fizetési módot?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="inherit">Mégse</Button>
                    <Button onClick={handleDelete} color="error">Törlés</Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}