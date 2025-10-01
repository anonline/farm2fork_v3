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
            field: 'name',
            headerName: 'Termék név',
            flex: 1,
            minWidth: 200,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        {params.row.productLink ? (
                            <Link href={params.row.productLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" fontWeight="medium">
                                    {params.value}
                                </Typography>
                            </Link>
                        ) : (
                            <Typography variant="body2" fontWeight="medium">
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
            field: 'totalQuantity',
            headerName: 'Mennyiség',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                    {params.value.toLocaleString('hu-HU')} {params.row.unit}
                </Typography>
            ),
        },
        {
            field: 'totalValue',
            headerName: 'Összérték',
            width: 140,
            align: 'center',
            headerAlign: 'center',

            disableColumnMenu: true,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                    {fCurrency(params.value)}
                </Typography>
            ),
        },
        {
            field: 'orderCount',
            headerName: 'Rendelések',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value}
                    color="primary"
                    sx={{

                        fontWeight: 'medium',
                    }}
                />
            ),
        }
    ], [theme]);

    const mobileColumns: GridColDef[] = useMemo(() => [
        {
            field: 'name',
            headerName: 'Termék név',
            flex: 1,
            hideable: false,
            disableColumnMenu: true,

            renderCell: (params) => (
                <Box sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, flexWrap: 'nowrap' }}>
                        {params.row.productLink ? (
                            <Link href={params.row.productLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" fontWeight="medium">
                                    {params.value}
                                </Typography>
                            </Link>
                        ) : (
                            <Typography variant="body2" fontWeight="medium">
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
            field: 'totalQuantity',
            headerName: 'Mennyiség',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                    {params.value.toLocaleString('hu-HU')} {params.row.unit}
                </Typography>
            ),
        },
        {
            field: 'orderCount',
            headerName: 'Rendelések',
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value}
                    color="primary"
                    sx={{
                        fontWeight: 'medium',
                    }}
                />
            ),
        }
    ], [theme]);

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
                pagination: { paginationModel: { pageSize: 25 } },
            }}
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
                pagination: { paginationModel: { pageSize: 25 } },
            }}
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