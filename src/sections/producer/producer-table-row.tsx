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
export function RenderCellProducingTags({ params }: ParamsProps) {
    const producingTags = params.row.producingTags.split(',').map((tag: string) => tag.trim());
    return (
        <>
            {producingTags.length > 0 &&
                producingTags.map((tag: string, index: number) => (
                    <Label key={index} variant="soft" color="default" sx={{ mr: 0.5, mb: 0.5 }}>
                        {tag}
                    </Label>
                ))}
        </>
    );
}

export function RenderCellBio({ params }: ParamsProps) {
    return (
        <Label variant="soft" color={params.row.bio ? 'success' : 'default'}>
            {params.row.bio ? 'Bio' : 'Nem bio'}
        </Label>
    );
}

export function RenderCellCreatedAt({ params }: ParamsProps) {
    return (
        <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{fDate(params.row.createdAt)}</span>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                {fTime(params.row.createdAt)}
            </Box>
        </Box>
    );
}

export function RenderCellName({ params, href }: ParamsProps & { href: string }) {
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
                src={params.row.featuredImage}
                variant="rounded"
                sx={{ width: 64, height: 64 }}
            />

            <ListItemText
                primary={
                    <Link component={RouterLink} href={href} color="inherit">
                        {params.row.name}
                    </Link>
                }
                secondary={params.row.companyName + ' | ' + params.row.location}
                slotProps={{
                    primary: { noWrap: true },
                    secondary: { sx: { color: 'text.disabled' } },
                }}
            />
        </Box>
    );
}
