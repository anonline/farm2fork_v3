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
import BioBadge from 'src/components/bio-badge/bio-badge';
import { NumberInput } from 'src/components/number-input';
import { Iconify } from 'src/components/iconify';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateProductStock } from 'src/actions/product-ssr';

// ----------------------------------------------------------------------

type ParamsProps = {
    params: GridCellParams;
};

type StockCellProps = ParamsProps & {
    onStockUpdate?: (productId: string, stock: number | null, backorder: boolean) => void;
};

export function RenderCellPrice({ params }: Readonly<ParamsProps>) {
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

export function RenderCellGrossPrice({ params }: Readonly<ParamsProps>) {
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

export function RenderCellUnit({ params }: Readonly<ParamsProps>) {
    return params.row.unit ?? 'db';
}

export function RenderCellPublish({ params }: Readonly<ParamsProps>) {
    return (
        <Label
            variant="filled"
            color={params.row.publish ? 'primary' : 'error'}
            style={{
                borderRadius: '50%',
                fontSize: '0.75rem',
                display: 'block',
                alignItems: 'center',
                justifyContent: 'center',
                height: '16px',
                width: '16px',
                padding: 0,
                minWidth: '16px',
                maxHeight: '16px',
            }}
        >
        </Label>
    );
}

export function RenderCellBio({ params }: Readonly<ParamsProps>) {
    return (
        <Label variant="soft" color={params.row.bio ? 'success' : 'default'}>
            {params.row.bio ? 'Bio' : 'Nem bio'}
        </Label>
    );
}

export function RenderCellCreatedAt({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
            <span>{fDate(params.row.createdAt)}</span>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                {fTime(params.row.createdAt)}
            </Box>
        </Box>
    );
}

export function RenderCellStock({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ width: 1, typography: 'caption', color: 'text.secondary' }}>
            {params.row.stock !== null && params.row.stock > 0 && (
                <Label variant="soft" color="success">
                    {params.row.stock} {params.row.unit ?? 'db'}
                </Label>
            )}

            {params.row.stock === null && (
                <Label variant="soft" color="default">
                    Raktáron
                </Label>
            )}

            {params.row.stock === 0 && (
                <Label variant="soft" color="error">
                    Elfogyott
                </Label>
            )}
        </Box>
    );
}

export function RenderCellStockNew({ params, onStockUpdate }: Readonly<StockCellProps>) {
    const [backorderEnabled, setBackorderEnabled] = useState(params.row.backorder);
    const [stockValue, setStockValue] = useState<number | null>(params.row.stock);

    const min = 0;
    const max = 9999;
    const step = params.row.stepQuantity || 1;

    // Use useMemo to preserve the original values
    const [originalStock, setOriginalStock] = useState(() => params.row.stock);
    const [originalBackorder, setOriginalBackorder] = useState(() => params.row.backorder);

    const handleStockChange = useCallback((event: any, value: number | null) => {
        setStockValue(value);
    }, []);

    const handleOutofStockButtonClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        setStockValue(prev => {
            if (prev === 0) {
                return min;
            } else {
                return 0;
            }
        });
    }, [min]);

    const handleBackorderClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        setBackorderEnabled((prev: boolean) => !prev);
    }, []);


    const handleSaveStockClick = useCallback(async () => {
        try {
            await updateProductStock(params.row.id, stockValue, backorderEnabled);
            setOriginalStock(stockValue);
            setOriginalBackorder(backorderEnabled);

            // Update parent component's data
            if (onStockUpdate) {
                onStockUpdate(params.row.id, stockValue, backorderEnabled);
            }

            toast.success(`${stockValue ?? 'Végtelen'} ${params.row.unit} készlet mentve${backorderEnabled ? ' utánrendeléssel' : ''}.`);
        } catch (error) {
            console.error('Error updating product stock:', error);
            toast.error('Hiba történt a készlet frissítésekor.');
        }
    }, [stockValue, backorderEnabled, params.row.id, params.row.unit, onStockUpdate]);

    // Auto-save when stock value or backorder status changes
    useEffect(() => {
        const hasStockChanged = stockValue !== originalStock;
        const hasBackorderChanged = backorderEnabled !== originalBackorder;

        if (hasStockChanged || hasBackorderChanged) {
            // Debounce the save to avoid too many calls
            const timeoutId = setTimeout(() => {
                handleSaveStockClick();
            }, 1000); // 1000ms debounce delay

            return () => {
                clearTimeout(timeoutId);
            };
        }
        return undefined;
    }, [stockValue, backorderEnabled, originalStock, originalBackorder, handleSaveStockClick]);

    return (
        <Box sx={{ width: 1, typography: 'caption', color: 'text.secondary' }}>
            <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'} mb={1}>
                <Iconify
                    icon="eva:minus-circle-fill"
                    width={24}
                    sx={{
                        color: stockValue === 0 ? 'error.main' : 'inherit',
                        cursor: 'pointer'
                    }}
                    onClick={handleOutofStockButtonClick}
                />

                <NumberInput
                    value={stockValue}
                    step={step}
                    digits={1}
                    min={min}
                    max={max}
                    suffix={params.row.unit ?? 'db'}
                    onChange={handleStockChange}
                    showInfinityOnNull={true}

                />

                <Iconify
                    icon="solar:box-minimalistic-bold"
                    width={24}
                    sx={{
                        color: backorderEnabled ? 'warning.main' : 'inherit',
                        cursor: 'pointer',

                    }}
                    onClick={handleBackorderClick}
                />

            </Box>

        </Box>
    );
}

export function RenderCellTags({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.row.tags
                ?.split('|')
                ?.map(
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

export function RenderCellCategories({ params }: Readonly<ParamsProps>) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.row.category?.map((category: ICategoryItem) => (
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
                sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 } }}
            />

            <ListItemText
                primary={
                    <Link component={RouterLink} href={href} color="inherit">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
                            <Box sx={{ display: { xs: 'inline-block', md: 'none' } }}>
                                <RenderCellPublish params={params} />
                            </Box>
                            {params.row.name} {params.row.bio && <BioBadge width={32} />}
                        </Box>
                    </Link>
                }
                secondary={<Box sx={{ width: '100%', mt: 1, display: { xs: 'block', md: 'none' } }}><RenderCellStockNew params={params} /></Box>}
                slotProps={{
                    primary: { noWrap: true },
                    secondary: { sx: { color: 'text.disabled' } },
                }}
            />
        </Box>
    );
}
