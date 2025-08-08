import type { GridCellParams } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fTime, fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type ParamsProps = {
    params: GridCellParams;
};

export function RenderCellEnabled({ params }: ParamsProps) {
    return (
        <Label variant="soft" color={params.row.enabled ? 'success' : 'default'} sx={{ px: 1 }}>
            {params.row.enabled ? 'Közzétéve' : 'Rejtett'}
        </Label>
    );
}

export function RenderCellCreatedAt({ params }: ParamsProps) {
    return (
        <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{fDate(params.row.created_at)}</span>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                {fTime(params.row.created_at)}
            </Box>
        </Box>
    );
}

export function RenderCellCategory({ params, href }: ParamsProps & { href: string }) {
    
    function stripHtml(description: any) {
        if (typeof description !== 'string') return '';
        return description.replace(/<[^>]*>/g, '').trim();
    }
    
    return (
        <Box
            sx={{
            py: 2,
            gap: 2,
            width: 1,
            display: 'flex',
            alignItems: 'center',
            }}
        >
            <Avatar
            alt={params.row.name}
            src={params.row.coverUrl}
            variant="rounded"
            sx={{ width: 64, height: 64, ml: { sx: 0, md: params.row.parentId ? `${params.row.level * 64}px` : 0 } }}
            />

            <ListItemText
            primary={
                <Link component={RouterLink} href={href} color="inherit">
                {params.row.name}
                </Link>
            }
            secondary={
                params.row.description &&
                params.row.description !== 'null' &&
                (
                (stripHtml(params.row.description).slice(0, 50)) +
                (stripHtml(params.row.description).length > 50 ? '...' : '')
                )
            }
            slotProps={{
                primary: { noWrap: true },
                secondary: { sx: { color: 'text.disabled' } },
            }}
            />
        </Box>
    );
}
