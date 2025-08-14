'use client';

import 'dayjs/locale/hu';

import type { Dayjs } from 'dayjs';
import type { GridColDef } from '@mui/x-data-grid';
import type { IShippingZone } from 'src/types/shipping';

import { useMemo, useState } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarQuickFilter
} from '@mui/x-data-grid';
import {
    Box,
    Card,
    Stack,
    Button,
    Dialog,
    Select,
    MenuItem,
    TextField,
    Typography,
    InputLabel,
    IconButton,
    DialogTitle,
    FormControl,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetShippingZones, createShippingZoneRules, deleteShippingZoneRules } from 'src/actions/shipping';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------


const dayMap: { [key: number]: string } = { 1: 'Hétfő', 2: 'Kedd', 3: 'Szerda', 4: 'Csütörtök', 5: 'Péntek', 6: 'Szombat', 0: 'Vasárnap' };

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter placeholder="Keresés irányítószámra..." />
        </GridToolbarContainer>
    );
}

export default function ShippingListView() {
    const { shippingZones, shippingZonesLoading, shippingZonesMutate } = useGetShippingZones();
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [zipCode, setZipCode] = useState('');
    const [currentRules, setCurrentRules] = useState<IShippingZone[]>([]);
    const [rulesInDialog, setRulesInDialog] = useState<Partial<IShippingZone>[]>([]);
    const [newOrderDay, setNewOrderDay] = useState<number | ''>('');
    const [newCutoffTime, setNewCutoffTime] = useState<Dayjs | null>(null);
    const [newDeliveryDay, setNewDeliveryDay] = useState<number | ''>('');

    const groupedZones = useMemo(() => {
        const groups: { [key: string]: IShippingZone[] } = shippingZones.reduce((acc, zone) => {
            const zip = zone.Iranyitoszam;
            if (!acc[zip]) { acc[zip] = []; }
            acc[zip].push(zone);
            return acc;
        }, {} as { [key: string]: IShippingZone[] });
        return Object.entries(groups).map(([zip, rules]) => ({ id: zip, zipCode: zip, rules }));
    }, [shippingZones]);

    const handleOpenNewDialog = () => {
        setIsEditMode(false);
        setZipCode('');
        setCurrentRules([]);
        setRulesInDialog([]);
        setNewOrderDay('');
        setNewCutoffTime(null);
        setNewDeliveryDay('');
        setOpenFormDialog(true);
    };

    const handleOpenEditDialog = (zone: { zipCode: string, rules: IShippingZone[] }) => {
        setIsEditMode(true);
        setZipCode(zone.zipCode);
        setCurrentRules([...zone.rules]);
        setRulesInDialog([...zone.rules]);
        setOpenFormDialog(true);
    };

    const handleAddRuleToDialog = () => {
        if (!zipCode || newOrderDay === '' || !newCutoffTime || newDeliveryDay === '') {
            toast.error('Minden mező kitöltése kötelező!');
            return;
        }
        const newRule = {
            Iranyitoszam: zipCode,
            RendelesiNap: newOrderDay,
            CutoffIdo: newCutoffTime.format('HH:mm:ss'),
            SzallitasiNap: newDeliveryDay,
        };
        setRulesInDialog(prev => [...prev, newRule]);
        setNewOrderDay('');
        setNewCutoffTime(null);
        setNewDeliveryDay('');
    };

    const handleDeleteRuleFromDialog = (index: number) => {
        setRulesInDialog(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveChanges = async () => {
        if (!zipCode || rulesInDialog.length === 0) {
            toast.error('Az irányítószám megadása és legalább egy szabály felvétele kötelező!');
            return;
        }
        try {
            if (isEditMode) {
                const idsToDelete = currentRules.map(r => r.ID).filter((id): id is number => !!id);
                if (idsToDelete.length > 0) {
                    await deleteShippingZoneRules(idsToDelete);
                }
            }
            const rulesToInsert = rulesInDialog.map(r => ({
                Iranyitoszam: zipCode,
                RendelesiNap: r.RendelesiNap!,
                CutoffIdo: r.CutoffIdo!,
                SzallitasiNap: r.SzallitasiNap!,
            }));
            await createShippingZoneRules(rulesToInsert);
            toast.success('Mentés sikeres!');
            shippingZonesMutate();
            setOpenFormDialog(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const usedOrderDays = useMemo(() => rulesInDialog.map(rule => rule.RendelesiNap), [rulesInDialog]);

    const columns: GridColDef[] = [
        {
            field: 'zipCode',
            headerName: 'Irányítószám',
            width: 150, align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="body2">{params.value}</Typography></Box>),
        },
        {
            field: 'rules', headerName: 'Szabályok', flex: 1, sortable: false, disableColumnMenu: true,
            renderCell: (params) => (
                <Stack spacing={1} sx={{ my: 1, width: '100%' }}>
                    {params.value.map((rule: IShippingZone) => (
                        <Typography key={rule.ID} variant="body2" sx={{ whiteSpace: 'normal' }}>
                            {`${dayMap[rule.RendelesiNap] || '?'} ${rule.CutoffIdo.slice(0, 5)} -> ${dayMap[rule.SzallitasiNap] || '?'}`}
                        </Typography>
                    ))}
                </Stack>
            ),
        },
        {
            field: 'actions', type: 'actions', headerName: '', width: 80, align: 'right',
            getActions: ({ row }) => [
                <GridActionsCellItem key="edit" icon={<Iconify icon="solar:pen-bold" />} label="Szerkesztés" onClick={() => handleOpenEditDialog(row)} showInMenu />,
            ],
        },
    ];

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Szállítási Zónák"
                links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Szállítási Zónák', href: paths.dashboard.shipping.root }]}
                action={
                    <Button onClick={handleOpenNewDialog} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        Új Szállítási Zóna
                    </Button>
                }
            />
            <Card sx={{ mt: 5 }}>
                <DataGrid
                    rows={groupedZones}
                    columns={columns}
                    loading={shippingZonesLoading}
                    getRowHeight={() => 'auto'}
                    disableRowSelectionOnClick
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    pageSizeOptions={[25, 50, 100]}
                    slots={{ toolbar: CustomToolbar }}
                />
            </Card>
            <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>{isEditMode ? `"${zipCode}" zóna szerkesztése` : 'Új Szállítási Zóna'}</DialogTitle>
                <DialogContent>
                    <Typography variant="h6" sx={{ mb: 3, mt: 1 }}>{isEditMode ? 'Szabályok kezelése' : 'Új irányítószám és szabályok'}</Typography>
                    {rulesInDialog.length > 0 && (
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            <Typography variant="subtitle1">Felvett szabályok</Typography>
                            {rulesInDialog.map((rule, index) => (
                                <Stack
                                    key={index}
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                    sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography sx={{ flexGrow: 1 }}>
                                        {`${dayMap[rule.RendelesiNap!]} ${rule.CutoffIdo!.slice(0, 5)} -> ${dayMap[rule.SzallitasiNap!]}`}
                                    </Typography>
                                    <IconButton onClick={() => handleDeleteRuleFromDialog(index)} color="error">
                                        <Iconify icon="solar:trash-bin-trash-bold" /></IconButton>
                                </Stack>
                            ))}
                        </Stack>
                    )}
                    <Stack spacing={2} sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle1">Új szabály hozzáadása</Typography>
                        <TextField
                            label="Irányítószám"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)} disabled={isEditMode || rulesInDialog.length > 0}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Rendelési nap</InputLabel>
                            <Select value={newOrderDay} label="Rendelési nap" onChange={(e) => setNewOrderDay(e.target.value as number)}>
                                {Object.entries(dayMap).map(([key, value]) => (
                                    <MenuItem key={key} value={Number(key)} disabled={usedOrderDays.includes(Number(key))}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="hu">
                            <TimePicker label="Határidő" value={newCutoffTime} onChange={(newValue) => setNewCutoffTime(newValue)} ampm={false} />
                        </LocalizationProvider>
                        <FormControl fullWidth>
                            <InputLabel>Szállítási nap</InputLabel>
                            <Select value={newDeliveryDay} label="Szállítási nap" onChange={(e) => setNewDeliveryDay(e.target.value as number)}>
                                {Object.entries(dayMap).map(([key, value]) => <MenuItem key={key} value={Number(key)}>{value}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Box><Button variant="contained" onClick={handleAddRuleToDialog}>Szabály hozzáadása a listához</Button></Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFormDialog(false)} color="inherit">Mégse</Button>
                    <Button onClick={handleSaveChanges} variant="contained">Változások mentése</Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}