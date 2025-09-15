import type { GridCellParams } from '@mui/x-data-grid';

import Box from '@mui/material/Box';

import { fTime, fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';
import { Link } from '@mui/material';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type ParamsProps = {
    params: GridCellParams;
};

export function RenderCellDate({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <Link href={paths.dashboard.shipments.details(params.row.id)}>{fDate(params.row.date, 'YYYY. MMMM DD. - dddd')}</Link>
        </Box>
    );
}

export function RenderCellUpdatedAt({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{fDate(params.row.updatedAt)}</span>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                {fTime(params.row.updatedAt)}
            </Box>
        </Box>
    );
}

export function RenderCellProductCount({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ textAlign: 'center' }}>
            {fNumber(params.row.productCount)}
        </Box>
    );
}

export function RenderCellOrderCount({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ textAlign: 'center' }}>
            {fNumber(params.row.orderCount)}
        </Box>
    );
}

export function RenderCellProductAmount({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ textAlign: 'right' }}>
            {fCurrency(params.row.productAmount)}
        </Box>
    );
}