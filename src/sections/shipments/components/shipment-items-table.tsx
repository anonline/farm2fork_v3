'use client';

import type { GridColDef } from '@mui/x-data-grid';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { Link, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';

import BioBadge from 'src/components/bio-badge/bio-badge';

import type { ShipmentItemSummary } from '../view/shipment-details-view';

// ----------------------------------------------------------------------



type Props = {
    data: ShipmentItemSummary[];
    loading?: boolean;
    error?: string | null;
};

// ----------------------------------------------------------------------

export function ShipmentItemsTable({ data, loading = false, error }: Readonly<Props>) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const columns: GridColDef[] = useMemo(() => [
        {
            field: 'totalQuantity',
            headerName: 'Mennyiség',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => {
                if (params.row.isBundleItem) {
                    // Bundle item format: "0.8 kg (2 x 0.4 kg)"
                    const total = params.value;
                    const parent = params.row.parentQuantity || 1;
                    const individual = params.row.individualQuantity || 0;
                    
                    return (
                        <Typography variant="caption" color="text.secondary">
                            {total.toLocaleString('hu-HU', { minimumFractionDigits: total % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 })} {params.row.unit}
                            {` (${parent} x ${individual.toLocaleString('hu-HU', { minimumFractionDigits: individual % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 })} ${params.row.unit})`}
                        </Typography>
                    );
                }
                
                // Main product format: "2 ea"
                return (
                    <Typography variant="body2" fontWeight="medium">
                        {params.value.toLocaleString('hu-HU')} {params.row.unit || 'db'}
                    </Typography>
                );
            },
        },
        {
            field: 'name',
            headerName: 'Termék név',
            flex: 1,
            minWidth: 200,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, pl: params.row.isBundleItem ? 4 : 0 }}>
                    <Box>
                        {params.row.productLink ? (
                            <Link href={params.row.productLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography 
                                    variant="body2" 
                                    fontWeight={params.row.isBundleItem ? "normal" : "medium"}
                                    sx={{ color: params.row.isBundleItem ? 'text.secondary' : 'text.primary' }}
                                >
                                    {params.value}
                                </Typography>
                            </Link>
                        ) : (
                            <Typography 
                                variant="body2" 
                                fontWeight={params.row.isBundleItem ? "normal" : "medium"}
                                sx={{ color: params.row.isBundleItem ? 'text.secondary' : 'text.primary' }}
                            >
                                {params.value}
                            </Typography>
                        )}
                    </Box>
                    {params.row.isBio && (
                        <BioBadge
                            style={{ flexShrink: 0 }}
                            width={32}
                            height={18}
                        />
                    )}
                </Box>
            ),
        },
        {
            field: 'totalValue',
            headerName: 'Összérték',
            width: 140,
            align: 'center',
            headerAlign: 'center',

            disableColumnMenu: true,
            renderCell: (params) => {
                if (params.row.isBundleItem) {
                    return null;
                }
                return (
                    <Typography variant="body2" fontWeight="medium">
                        {fCurrency(params.value)}
                    </Typography>
                );
            },
        },
        {
            field: 'orderCount',
            headerName: 'Rendelések',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => {
                if (params.row.isBundleItem) {
                    return null;
                }
                return (
                    <Chip
                        size="small"
                        label={params.value}
                        color="primary"
                        sx={{

                            fontWeight: 'medium',
                        }}
                    />
                );
            },
        }
    ], []);

    const mobileColumns: GridColDef[] = useMemo(() => [
        {
            field: 'name',
            headerName: 'Termék név',
            flex: 1,
            hideable: false,
            disableColumnMenu: true,

            renderCell: (params) => (
                <Box sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1, pl: params.row.isBundleItem ? 2 : 0 }}>
                    <Box sx={{ flex: 1, flexWrap: 'nowrap' }}>
                        {params.row.productLink ? (
                            <Link href={params.row.productLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography 
                                    variant="body2" 
                                    fontWeight={params.row.isBundleItem ? "normal" : "medium"}
                                    sx={{ color: params.row.isBundleItem ? 'text.secondary' : 'text.primary' }}
                                >
                                    {params.value}
                                </Typography>
                            </Link>
                        ) : (
                            <Typography 
                                variant="body2" 
                                fontWeight={params.row.isBundleItem ? "normal" : "medium"}
                                sx={{ color: params.row.isBundleItem ? 'text.secondary' : 'text.primary' }}
                            >
                                {params.value}
                            </Typography>
                        )}
                    </Box>
                    {params.row.isBio && !params.row.isBundleItem && (
                        <BioBadge
                            style={{ flexShrink: 0 }}
                            width={32}
                            height={18}
                        />
                    )}
                </Box>
            ),
        },
        {
            field: 'totalQuantity',
            headerName: 'Mennyiség',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => {
                if (params.row.isBundleItem) {
                    const total = params.value;
                    const parent = params.row.parentQuantity || 1;
                    const individual = params.row.individualQuantity || 0;
                    
                    return (
                        <Typography variant="caption" color="text.secondary">
                            {total.toLocaleString('hu-HU', { minimumFractionDigits: total % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 })} {params.row.unit}
                            {parent > 1 && ` (${parent} x ${individual.toLocaleString('hu-HU', { minimumFractionDigits: individual % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 })} ${params.row.unit})`}
                        </Typography>
                    );
                }
                
                return (
                    <Box>
                        <Typography variant="body2" fontWeight="medium">
                            {params.value.toLocaleString('hu-HU')} {params.row.unit || 'db'}
                        </Typography>
                    </Box>
                );
            },
        },
        /*{
            field: 'orderCount',
            headerName: 'Rendelések',
            align: 'center',
            flex: 1,
            width: 20,
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => {
                if (params.row.isBundleItem) {
                    return null;
                }
                return (
                    <Chip
                        size="small"
                        label={params.value}
                        color="primary"
                        sx={{
                            fontWeight: 'medium',
                        }}
                    />
                );
            },
        }*/
    ], []);

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    const renderMobileDataGrid = () => (
        <DataGrid
            checkboxSelection={false}
            disableRowSelectionOnClick
            rows={data}
            columns={mobileColumns}
            loading={loading}
            getRowId={(row) => row.id}
            hideFooter={data.length <= 25}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
                pagination: { paginationModel: { pageSize: 100 } },
            }}
            getRowClassName={(params) => params.row.isBundleItem ? 'bundle-item-row' : ''}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDataGrid-cell': {
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    alignContent: 'center',
                },
                '& .MuiDataGrid-cell[data-field="name"]': {
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                },
                '& .MuiDataGrid-row': {
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                },
                '& .MuiDataGrid-row.bundle-item-row': {
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    '&:hover': {
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                    },
                },
                '& .MuiDataGrid-columnHeader': {
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    color: 'text.primary',
                    fontWeight: 'fontWeightSemiBold',
                    textAlign: 'center',
                    justifyContent: 'center',
                },
                '& .MuiDataGrid-columnHeader[data-field="name"]': {
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                },
            }}
        />
    );

    const renderDesktopDataGrid = () => (
        <DataGrid
            checkboxSelection={false}
            disableRowSelectionOnClick
            rows={data}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            hideFooter={data.length <= 25}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
                pagination: { paginationModel: { pageSize: 100 } },
            }}
            getRowClassName={(params) => params.row.isBundleItem ? 'bundle-item-row' : ''}
            sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDataGrid-cell': {
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    alignContent: 'center',
                },
                '& .MuiDataGrid-cell[data-field="name"]': {
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                },
                '& .MuiDataGrid-row': {
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                },
                '& .MuiDataGrid-row.bundle-item-row': {
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    '&:hover': {
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                    },
                },
                '& .MuiDataGrid-columnHeader': {
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    color: 'text.primary',
                    fontWeight: 'fontWeightSemiBold',
                    textAlign: 'center',
                    justifyContent: 'center',
                },
                '& .MuiDataGrid-columnHeader[data-field="name"]': {
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                },
            }}
        />
    );

    return (
        <>
            {isMobile ? renderMobileDataGrid() : renderDesktopDataGrid()}
        </>
    );
}