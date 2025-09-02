import type { GridCellParams } from '@mui/x-data-grid';
import type { ICategoryItem } from 'src/types/category';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type ParamsProps = {
    params: GridCellParams;
};

export function RenderCellPrice({ params }: ParamsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Label variant="soft" color="default">
                {fCurrency(params.row.netPrice)}
            </Label>
            {params.row.netPriceVIP !== params.row.netPrice && params.row.netPriceVIP && (
                <Label variant="soft" color="warning">
                    VIP: {fCurrency(params.row.netPriceVIP)}
                </Label>
            )}
            {params.row.netPriceCompany !== params.row.netPrice && params.row.netPriceCompany && (
                <Label variant="soft" color="error">
                    Cég: {fCurrency(params.row.netPriceCompany)}
                </Label>
            )}
        </Box>
    );
}

export function RenderCellGrossPrice({ params }: ParamsProps) {
    const vatMultiplier = 1 + (params.row.vat ?? 27) / 100;
    const grossPrice = params.row.netPrice * vatMultiplier;
    const grossPriceCompany = params.row.netPriceCompany
        ? params.row.netPriceCompany * vatMultiplier
        : null;

    return (
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Label variant="soft" color="default">
                {fCurrency(grossPrice)}
            </Label>
            {params.row.netPriceVIP !== params.row.netPrice && params.row.netPriceVIP && (
                <Label variant="soft" color="warning">
                    VIP: {fCurrency(params.row.netPriceVIP)}
                </Label>
            )}
            {params.row.netPriceCompany !== params.row.netPrice && grossPriceCompany && (
                <Label variant="soft" color="error">
                    Cég: {fCurrency(grossPriceCompany)}
                </Label>
            )}
        </Box>
    );
}

export function RenderCellUnit({ params }: ParamsProps) {
    return params.row.unit ?? 'db';
}

export function RenderCellPublish({ params }: ParamsProps) {
    return (
        <Label variant="soft" color={params.row.publish ? 'success' : 'default'}>
            {params.row.publish ? 'Közzétéve' : 'Rejtett'}
        </Label>
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

export function RenderCellStock({ params }: ParamsProps) {
    return (
        <Box sx={{ width: 1, typography: 'caption', color: 'text.secondary' }}>
            {/*<LinearProgress
                value={(params.row.available * 100) / params.row.quantity}
                variant="determinate"
                color={
                    (params.row.inventoryType === 'out of stock' && 'error') ||
                    (params.row.inventoryType === 'low stock' && 'warning') ||
                    'success'
                }
                sx={{ mb: 1, height: 6, width: 80 }}
            />
            {!!params.row.available && params.row.available} {params.row.inventoryType}*/}
            {params.row.stock ? (
                <Label variant="soft" color="success">
                    {params.row.stock} {params.row.unit ?? 'db'}
                </Label>
            ) : (
                <Label variant="soft" color="default">
                    Raktáron
                </Label>
            )}
        </Box>
    );
}

export function RenderCellTags({ params }: ParamsProps) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.row.tags &&
                params.row.tags
                    .replaceAll(',', ' ')
                    .split(' ')
                    .map(
                        (tag: string) =>
                            tag.trim().length > 0 && (
                                <Label key={tag.trim()} variant="soft" color="default">
                                    {tag}
                                </Label>
                            )
                    )}
        </Box>
    );
}

export function RenderCellCategories({ params }: ParamsProps) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.row.category &&
                params.row.category.map((category: ICategoryItem) => (
                    <Label key={category.id} variant="soft" color="default">
                        {category.name}
                    </Label>
                ))}
        </Box>
    );
}

export function RenderCellProduct({ params, href }: ParamsProps & { href: string }) {
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
                src={
                    params.row.featuredImage ??
                    'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'
                }
                variant="rounded"
                sx={{ width: 64, height: 64 }}
            />

            <ListItemText
                primary={
                    <Link component={RouterLink} href={href} color="inherit">
                        {params.row.name}
                    </Link>
                }
                slotProps={{
                    primary: { noWrap: true },
                    secondary: { sx: { color: 'text.disabled' } },
                }}
            />
        </Box>
    );
}
