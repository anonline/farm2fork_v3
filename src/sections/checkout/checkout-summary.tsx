import type { Theme, SxProps } from '@mui/material/styles';
import type { CheckoutContextValue } from 'src/types/checkout';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    onEdit?: () => void;
    checkoutState: CheckoutContextValue['state'];
    onApplyDiscount?: CheckoutContextValue['onApplyDiscount'];
};

export function CheckoutSummary({ onEdit, checkoutState, onApplyDiscount }: Readonly<Props>) {
    const { shipping, subtotal, discount, total } = checkoutState;

    const displayShipping = shipping !== null ? 'Szállítási módtól függ' : '-';

    const rowStyles: SxProps<Theme> = {
        display: 'flex',
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader
                title="Vásárlás részletei"
                action={
                    onEdit && (
                        <Button
                            size="small"
                            onClick={onEdit}
                            startIcon={<Iconify icon="solar:pen-bold" />}
                        >
                            Edit
                        </Button>
                    )
                }
            />
            <Stack spacing={2} sx={{ p: 3 }}>
                <Box sx={{ ...rowStyles }}>
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                        Összeg
                    </Typography>
                    <Typography component="span" variant="subtitle2">
                        {fCurrency(subtotal)}
                    </Typography>
                </Box>

                <Box sx={{ ...rowStyles }}>
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                        Kedvezmény
                    </Typography>
                    <Typography component="span" variant="subtitle2">
                        {discount ? fCurrency(-discount) : '-'}
                    </Typography>
                </Box>

                <Box sx={{ ...rowStyles }}>
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                        Szállítás
                    </Typography>
                    <Typography component="span" variant="subtitle2" sx={{ fontStyle: 'italic', fontWeight: '400', fontSize: '14px', lineHeight: '22px', color: '#979594' }}>
                        {shipping ? fCurrency(shipping) : displayShipping}
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ ...rowStyles }}>
                    <Typography component="span" variant="subtitle1" sx={{ flexGrow: 1 }}>
                        Összesen
                    </Typography>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography
                            component="span"
                            variant="subtitle1"
                            sx={{ display: 'block', fontWeight: '600', fontSize: '28px', lineHeight: '40px' }}
                        >
                            kb. {fCurrency(total)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                            A végleges árat a rendelés feldolgozása után tudjuk pontosítani.
                        </Typography>
                    </Box>
                </Box>

                {onApplyDiscount && (
                    <TextField
                        fullWidth
                        placeholder="Kedvezmény kódok / Ajándékok"
                        value="DISCOUNT5"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            color="primary"
                                            onClick={() => onApplyDiscount(5)}
                                            sx={{ mr: -0.5 }}
                                        >
                                            Apply
                                        </Button>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                )}
            </Stack>
        </Card>
    );
}
