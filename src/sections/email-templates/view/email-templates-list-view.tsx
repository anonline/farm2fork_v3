'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { EmailTrigger } from 'src/types/emails/email-trigger';
import type {
    GridColDef,
    GridSlotProps,
    GridRowSelectionModel,
} from '@mui/x-data-grid';

import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
    DataGrid,
    gridClasses,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteEmailTemplate, useGetEmailTemplates, toggleEmailTemplateStatus } from 'src/actions/email';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
    sx?: SxProps<Theme>;
};

export function EmailTemplatesListView({ sx }: Props) {
    const confirmRows = useBoolean();

    const { templates, templatesLoading, refreshTemplates } = useGetEmailTemplates();
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
    
    const dataFiltered = templates;

    const handleDeleteRow = useCallback(async (id: string) => {
        try {
            await deleteEmailTemplate(id as EmailTrigger);
            refreshTemplates();
            toast.success('Email template deleted!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete email template');
        }
    }, [refreshTemplates]);

    const handleToggleStatus = useCallback(async (type: EmailTrigger, enabled: boolean) => {
        try {
            await toggleEmailTemplateStatus(type, enabled);
            refreshTemplates();
            toast.success(`Email template ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update email template status');
        }
    }, [refreshTemplates]);

    const handleDeleteRows = useCallback(async () => {
        try {
            await Promise.all(selectedRowIds.map(id => deleteEmailTemplate(id as EmailTrigger)));
            refreshTemplates();
            setSelectedRowIds([]);
            toast.success('Email templates deleted!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete email templates');
        }
    }, [selectedRowIds, refreshTemplates]);



    const columns: GridColDef[] = [
        {
            field: 'type',
            headerName: 'Típus',
            flex: 1,
            minWidth: 160,
            hideable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {params.value.replace(/_/g, ' ')}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'subject',
            headerName: 'Tárgy',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" noWrap>
                    {params.value || 'No subject'}
                </Typography>
            ),
        },
        {
            field: 'enabled',
            headerName: 'Státusz',
            width: 120,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={(event) => handleToggleStatus(params.row.type, event.target.checked)}
                    size="small"
                />
            ),
        },
        {
            type: 'actions',
            field: 'actions',
            headerName: ' ',
            align: 'right',
            headerAlign: 'right',
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            getActions: (params) => [
                <IconButton
                    key="edit"
                    component={RouterLink}
                    href={paths.dashboard.emailtemplates.editTemplate(params.row.type)}
                    size="small"
                >
                    <Iconify icon="solar:pen-bold" />
                </IconButton>,
            ],
        },
    ];

    return (
        
            <DashboardContent sx={sx}>
                <CustomBreadcrumbs
                    heading="Email sablonok"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Email sablonok' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Card>
                    <DataGrid
                        disableRowSelectionOnClick
                        rows={dataFiltered}
                        columns={columns}
                        loading={templatesLoading}
                        getRowId={(row) => row.type}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
                        slots={{
                            noRowsOverlay: () => <EmptyContent title="No templates found" />,
                        }}
                        slotProps={{
                            panel: { placement: 'top' } as GridSlotProps['panel'],
                        }}
                        sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
                    />
                </Card>
            </DashboardContent>

            
        
    );
}