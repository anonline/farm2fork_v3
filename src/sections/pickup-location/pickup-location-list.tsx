'use client';

import type { GridColDef } from '@mui/x-data-grid';
import type { IPickupLocation } from 'src/types/pickup-location';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
    Box,
    Card,
    Grid,
    Stack,
    Button,
    Dialog,
    Switch,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
    FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { createPickupLocation, updatePickupLocation, deletePickupLocation, useGetPickupLocations } from 'src/actions/pickup-location';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------


export default function PickupLocationListView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { locations, locationsLoading, locationsMutate } = useGetPickupLocations();

    const [dialogState, setDialogState] = useState({ open: false, view: 'form' as 'form' | 'confirmDelete' });
    const [editingLocation, setEditingLocation] = useState<IPickupLocation | null>(null);

    const defaultValues = useMemo(() => ({
        name: '',
        postcode: '',
        city: '',
        address: '',
        note: '',
        mondayOpen: null as any,
        mondayClose: null as any,
        mondayClosed: false,
        tuesdayOpen: null as any,
        tuesdayClose: null as any,
        tuesdayClosed: false,
        wednesdayOpen: null as any,
        wednesdayClose: null as any,
        wednesdayClosed: false,
        thursdayOpen: null as any,
        thursdayClose: null as any,
        thursdayClosed: false,
        fridayOpen: null as any,
        fridayClose: null as any,
        fridayClosed: false,
        saturdayOpen: null as any,
        saturdayClose: null as any,
        saturdayClosed: false,
        sundayOpen: null as any,
        sundayClose: null as any,
        sundayClosed: false,
    }), []);

    const rhfMethods = useForm<PickupLocationSchemaType>({
        resolver: zodResolver(PickupLocationSchema),
        defaultValues,
    });

    const { reset, control, handleSubmit, formState: { isSubmitting } } = rhfMethods;

    const handleOpenNew = () => {
        reset(defaultValues);
        setEditingLocation(null);
        setDialogState({ open: true, view: 'form' });
    };

    const parseTimeString = (timeString?: string) => {
        if (!timeString || timeString === 'zárva' || timeString === '') {
            return { open: null, close: null, closed: true };
        }

        const timeRange = timeString.split('-');
        if (timeRange.length === 2) {
            const openTime = dayjs(`2024-01-01 ${timeRange[0]}`, 'YYYY-MM-DD HH:mm');
            const closeTime = dayjs(`2024-01-01 ${timeRange[1]}`, 'YYYY-MM-DD HH:mm');
            return {
                open: openTime.isValid() ? openTime : null,
                close: closeTime.isValid() ? closeTime : null,
                closed: false
            };
        }

        return { open: null, close: null, closed: true };
    };

    const handleOpenEdit = (row: IPickupLocation) => {
        const mondayTime = parseTimeString(row.monday);
        const tuesdayTime = parseTimeString(row.tuesday);
        const wednesdayTime = parseTimeString(row.wednesday);
        const thursdayTime = parseTimeString(row.thursday);
        const fridayTime = parseTimeString(row.friday);
        const saturdayTime = parseTimeString(row.saturday);
        const sundayTime = parseTimeString(row.sunday);

        const editData = {
            name: row.name,
            postcode: row.postcode,
            city: row.city,
            address: row.address,
            note: row.note || '',
            mondayOpen: mondayTime.open,
            mondayClose: mondayTime.close,
            mondayClosed: mondayTime.closed,
            tuesdayOpen: tuesdayTime.open,
            tuesdayClose: tuesdayTime.close,
            tuesdayClosed: tuesdayTime.closed,
            wednesdayOpen: wednesdayTime.open,
            wednesdayClose: wednesdayTime.close,
            wednesdayClosed: wednesdayTime.closed,
            thursdayOpen: thursdayTime.open,
            thursdayClose: thursdayTime.close,
            thursdayClosed: thursdayTime.closed,
            fridayOpen: fridayTime.open,
            fridayClose: fridayTime.close,
            fridayClosed: fridayTime.closed,
            saturdayOpen: saturdayTime.open,
            saturdayClose: saturdayTime.close,
            saturdayClosed: saturdayTime.closed,
            sundayOpen: sundayTime.open,
            sundayClose: sundayTime.close,
            sundayClosed: sundayTime.closed,
        };

        reset(editData);
        setEditingLocation(row);
        setDialogState({ open: true, view: 'form' });
    };

    const handleCloseDialog = () => {
        setDialogState({ open: false, view: 'form' });
        setEditingLocation(null);
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            const formatTimeRange = (openTime: any, closeTime: any, isClosed: boolean) => {
                if (isClosed || !openTime || !closeTime) {
                    return 'zárva';
                }
                const open = dayjs(openTime).format('HH:mm');
                const close = dayjs(closeTime).format('HH:mm');
                return `${open}-${close}`;
            };

            const submitData = {
                name: data.name,
                postcode: data.postcode,
                city: data.city,
                address: data.address,
                note: data.note,
                monday: formatTimeRange(data.mondayOpen, data.mondayClose, data.mondayClosed),
                tuesday: formatTimeRange(data.tuesdayOpen, data.tuesdayClose, data.tuesdayClosed),
                wednesday: formatTimeRange(data.wednesdayOpen, data.wednesdayClose, data.wednesdayClosed),
                thursday: formatTimeRange(data.thursdayOpen, data.thursdayClose, data.thursdayClosed),
                friday: formatTimeRange(data.fridayOpen, data.fridayClose, data.fridayClosed),
                saturday: formatTimeRange(data.saturdayOpen, data.saturdayClose, data.saturdayClosed),
                sunday: formatTimeRange(data.sundayOpen, data.sundayClose, data.sundayClosed),
            };

            if (editingLocation) {
                await updatePickupLocation(editingLocation.id, submitData);
                toast.success('Sikeres mentés!');
            } else {
                await createPickupLocation(submitData);
                toast.success('Sikeres létrehozás!');
            }
            locationsMutate();
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    });

    const handleDelete = async () => {
        if (!editingLocation) return;
        try {
            await deletePickupLocation(editingLocation.id);
            toast.success('Sikeresen törölve!');
            locationsMutate();
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const columns: GridColDef<IPickupLocation>[] = useMemo(() => {
        const baseColumns: GridColDef<IPickupLocation>[] = [
            { field: 'name', headerName: 'Név', flex: 1, minWidth: 180 },
            { field: 'city', headerName: 'Város', width: 150 },
            { field: 'address', headerName: 'Cím', flex: 1, minWidth: 200 },
        ];

        if (!isMobile) {
            baseColumns.splice(2, 0, { field: 'postcode', headerName: 'Irányítószám', width: 120 });
            baseColumns.push({ field: 'note', headerName: 'Megjegyzés', width: 200 });
        }

        baseColumns.push({
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
                    onClick={() => handleOpenEdit(row)}
                />
            ],
        });

        return baseColumns;
    }, [isMobile]);

    const renderDialogContent = () => {
        if (dialogState.view === 'confirmDelete') {
            return (
                <>
                    <DialogTitle>Törlés Megerősítése</DialogTitle>
                    <DialogContent>
                        <Typography>Biztosan törölni szeretnéd a(z) <strong>{editingLocation?.name}</strong> átvételi pontot?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogState({ ...dialogState, view: 'form' })} color="inherit">Vissza</Button>
                        <Button onClick={handleDelete} color="error">Törlés</Button>
                    </DialogActions>
                </>
            );
        }

        return (
            <FormProvider {...rhfMethods}>
                <form onSubmit={onSubmit}>
                    <DialogTitle>{editingLocation ? `"${editingLocation.name}" szerkesztése` : 'Új átvételi pont'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ pt: 1 }}>
                            {/* Left Column - Basic Data */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={3}>
                                    <Typography variant="h6">Alapadatok</Typography>
                                    <RHFTextField name="name" label="Név" />
                                    <Stack direction="row" spacing={2}>
                                        <RHFTextField name="postcode" label="Irányítószám" sx={{ maxWidth: 150 }} />
                                        <RHFTextField name="city" label="Város" />
                                    </Stack>
                                    <RHFTextField name="address" label="Cím" />
                                    <RHFTextField name="note" label="Megjegyzés" multiline rows={3} />
                                </Stack>
                            </Grid>

                            {/* Right Column - Opening Hours */}
                            <Grid size={{ xs: 12, md: 6 }}>

                                <Stack spacing={3}>
                                    <Typography variant="h6">Nyitvatartás</Typography>

                                    {WEEKDAYS.map((day) => (
                                        <Box key={day.field}>
                                            <Controller
                                                name={`${day.field}Closed` as any}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Switch {...field} checked={field.value} />}
                                                        label={`${day.label} - Zárva`}
                                                        sx={{ mb: 1 }}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name={`${day.field}Closed` as any}
                                                control={control}
                                                render={({ field: { value: isClosed } }) => (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Controller
                                                            name={`${day.field}Open` as any}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <TimePicker
                                                                    ampm={false}
                                                                    label="Nyitás"
                                                                    disabled={isClosed}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            variant: isClosed ? 'filled' : 'outlined'
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        <Typography>-</Typography>
                                                        <Controller
                                                            name={`${day.field}Close` as any}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <TimePicker
                                                                    ampm={false}
                                                                    label="Zárás"
                                                                    disabled={isClosed}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            variant: isClosed ? 'filled' : 'outlined'
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Stack>
                                                )}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {editingLocation && (
                            <Button
                                onClick={() => setDialogState({ ...dialogState, view: 'confirmDelete' })}
                                color="error"
                                variant="outlined"
                            >
                                Törlés
                            </Button>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <Button onClick={handleCloseDialog} color="inherit">Mégse</Button>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            {editingLocation ? 'Mentés' : 'Létrehozás'}
                        </LoadingButton>
                    </DialogActions>
                </form>
            </FormProvider>
        );
    };

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Átvételi Pontok"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Beállítások' },
                    { name: 'Átvételi Pontok' }
                ]}
                action={
                    <Button
                        onClick={handleOpenNew}
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                    >
                        Új Átvételi Pont
                    </Button>
                }
            />
            <Card sx={{ mt: 5 }}>
                <DataGrid
                    rows={locations}
                    columns={columns}
                    loading={locationsLoading}
                    autoHeight
                    disableRowSelectionOnClick
                    initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                    pageSizeOptions={[20, 40, 60]}
                />
            </Card>
            <Dialog
                open={dialogState.open}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: { minHeight: '600px' }
                }}
            >
                {renderDialogContent()}
            </Dialog>
        </DashboardContent>
    );
}


// ----------------------------------------------------------------------


const PickupLocationSchema = zod.object({
    name: zod.string().min(1, { message: 'Név megadása kötelező' }),
    postcode: zod.string().min(1, { message: 'Irányítószám megadása kötelező' }),
    city: zod.string().min(1, { message: 'Város megadása kötelező' }),
    address: zod.string().min(1, { message: 'Cím megadása kötelező' }),
    note: zod.string().optional(),
    mondayOpen: zod.any().optional(),
    mondayClose: zod.any().optional(),
    mondayClosed: zod.boolean(),
    tuesdayOpen: zod.any().optional(),
    tuesdayClose: zod.any().optional(),
    tuesdayClosed: zod.boolean(),
    wednesdayOpen: zod.any().optional(),
    wednesdayClose: zod.any().optional(),
    wednesdayClosed: zod.boolean(),
    thursdayOpen: zod.any().optional(),
    thursdayClose: zod.any().optional(),
    thursdayClosed: zod.boolean(),
    fridayOpen: zod.any().optional(),
    fridayClose: zod.any().optional(),
    fridayClosed: zod.boolean(),
    saturdayOpen: zod.any().optional(),
    saturdayClose: zod.any().optional(),
    saturdayClosed: zod.boolean(),
    sundayOpen: zod.any().optional(),
    sundayClose: zod.any().optional(),
    sundayClosed: zod.boolean(),
});

type PickupLocationSchemaType = zod.infer<typeof PickupLocationSchema>;

const WEEKDAYS = [
    { field: 'monday' as const, label: 'Hétfő' },
    { field: 'tuesday' as const, label: 'Kedd' },
    { field: 'wednesday' as const, label: 'Szerda' },
    { field: 'thursday' as const, label: 'Csütörtök' },
    { field: 'friday' as const, label: 'Péntek' },
    { field: 'saturday' as const, label: 'Szombat' },
    { field: 'sunday' as const, label: 'Vasárnap' },
];
