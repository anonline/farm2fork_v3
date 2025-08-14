'use client';

import type { GridColDef } from '@mui/x-data-grid';

import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

import { useShipping } from 'src/contexts/shipping-context';


// ----------------------------------------------------------------------


const dayMap: { [key: number]: string } = {
    1: 'Hétfő',
    2: 'Kedd',
    3: 'Szerda',
    4: 'Csütörtök',
    5: 'Péntek',
    6: 'Szombat',
    7: 'Vasárnap',
};

export default function ShippingList() {
    const { shippingZones, loading } = useShipping();

    const groupedZones = useMemo(() => {
        if (!shippingZones) return [];

        const groups: { [key: string]: typeof shippingZones } = shippingZones.reduce((acc, zone) => {
            const zip = zone.Iranyitoszam;
            if (!acc[zip]) {
                acc[zip] = [];
            }
            acc[zip].push(zone);
            return acc;
        }, {} as { [key: string]: typeof shippingZones });

        return Object.entries(groups).map(([zip, rules]) => ({
            id: zip,
            zipCode: zip,
            rules,
        }));
    }, [shippingZones]);

    const columns: GridColDef[] = [
        {
            field: 'zipCode',
            headerName: 'Irányítószám',
            width: 150,
        },
        {
            field: 'rules',
            headerName: 'Szabályok',
            flex: 1,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Stack spacing={1} sx={{ my: 1, width: '100%' }}>
                    {params.value.map((rule: any) => (
                        <Typography key={rule.ID} variant="body2" sx={{ whiteSpace: 'normal' }}>
                            {`${dayMap[rule.RendelesiNap] || 'Ismeretlen nap'} ${rule.CutoffIdo.slice(0, 5)} -> ${dayMap[rule.SzallitasiNap] || 'Ismeretlen nap'}`}
                        </Typography>
                    ))}
                </Stack>
            ),
        },
        // A jövőben ide jöhetnek a szerkesztés/törlés gombok
    ];

    return (
        <Card sx={{ mt: 5 }}>
            <DataGrid
                rows={groupedZones}
                columns={columns}
                loading={loading}
                autoHeight
                disableRowSelectionOnClick
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10 },
                    },
                }}
                pageSizeOptions={[10, 25, 50]}
            />
        </Card>
    );
}