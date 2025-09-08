import type { CardProps } from '@mui/material/Card';
import type { IOrderProductItem } from 'src/types/order';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/routes/paths';
import { Link } from '@mui/material';

// ----------------------------------------------------------------------

type Props = CardProps & {
    taxes?: number;
    shipping?: number;
    discount?: number;
    subtotal?: number;
    totalAmount?: number;
    surcharge?: number;
    items?: IOrderProductItem[];
};

export function OrderDetailsItems({
    sx,
    taxes,
    shipping,
    discount,
    subtotal,
    surcharge,
    items = [],
    totalAmount,
    ...other
}: Props) {
    const renderTotal = () => (
        <Box
            sx={{
                p: 3,
                gap: 2,
                display: 'flex',
                textAlign: 'right',
                typography: 'body2',
                alignItems: 'flex-end',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary' }}>Termék végösszeg</Box>
                <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subtotal) || '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary' }}>Szállítás</Box>
                <Box sx={{ width: 160 }}>
                    {shipping ? fCurrency(shipping) : '-'}
                </Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary' }}>Kedvezmény</Box>
                <Box sx={{ width: 160, ...(discount && { color: 'error.main' }) }}>
                    {discount ? `- ${fCurrency(discount)}` : '-'}
                </Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary' }}>Adó</Box>

                <Box sx={{ width: 160 }}>{taxes ? fCurrency(taxes) : '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary' }}>Zárolási felár</Box>

                <Box sx={{ width: 160 }}>{surcharge ? fCurrency(surcharge) : '-'}</Box>
            </Box>

            <Box sx={{ display: 'flex', typography: 'subtitle1' }}>
                <div>Br. végösszeg</div>
                <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
            </Box>
        </Box>
    );

    return (
        <Card sx={sx} {...other}>
            <CardHeader
                title="Részletek"
                action={
                    <IconButton>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                }
            />

            <Scrollbar>
                {items.map((item) => (
                    <Box
                        key={item.id}
                        sx={[
                            (theme) => ({
                                p: 3,
                                minWidth: 640,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: `dashed 2px ${theme.vars.palette.background.neutral}`,
                            }),
                        ]}
                    >
                        <Avatar
                            src={item.coverUrl || 'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'}
                            variant="rounded"
                            sx={{ width: 48, height: 48, mr: 2 }}
                        />

                        <ListItemText
                            primary={
                                <Link 
                                    href={paths.dashboard.product.edit(item.slug)} 
                                    sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { fontWeight: 600, textDecoration: 'none' } }}
                                >
                                    {item.name}
                                </Link>
                            }
                            secondary={`${fCurrency(item.price)} / ${item.unit}`}
                            slotProps={{
                                primary: { sx: { typography: 'body2' }},
                                secondary: {
                                    sx: { mt: 0.5, color: 'text.disabled' },
                                },
                            }}
                        />

                        <Box sx={{ typography: 'subtitle2' }}>{item.quantity.toFixed(item.quantity % 1 === 0 ? 0:2)} {item.unit}</Box>

                        <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                            {fCurrency(item.subtotal)}
                        </Box>
                    </Box>
                ))}
            </Scrollbar>

            {renderTotal()}
        </Card>
    );
}
