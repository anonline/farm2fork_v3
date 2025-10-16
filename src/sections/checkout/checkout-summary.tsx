import type { Theme, SxProps } from '@mui/material/styles';
import type { CheckoutContextValue } from 'src/types/checkout';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { fCurrency } from 'src/utils/format-number';

import { Scrollbar } from 'src/components/scrollbar';
import F2FIcons from 'src/components/f2ficons/f2ficons';
import { SideCartItem } from 'src/components/sidecart/sidecart';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

type Props = {
    onEdit?: () => void;
    checkoutState: CheckoutContextValue['state'];
    onApplyDiscount?: CheckoutContextValue['onApplyDiscount'];
    activeStep?: CheckoutContextValue['activeStep'];
};

export function CheckoutSummary({
    onEdit,
    checkoutState,
    onApplyDiscount,
    activeStep,
}: Readonly<Props>) {
    const { user } = useAuthContext();
    const { shipping, subtotal, discount, surcharge, total } = checkoutState;

    const getUserType = () => {
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    };

    const getSubtotalToShow = () => {
        const userType = getUserType();
        switch (userType) {
            case 'vip':
            case 'company':
                return checkoutState.items.reduce((sum, item) => { ;
                    return sum + item.netPrice * item.quantity;
                }, 0);
            default:
                return subtotal;
        }
    }

    const displayShipping = shipping !== null ? 'Szállítási módtól függ' : '-';

    const rowStyles: SxProps<Theme> = {
        display: 'flex',
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Vásárlás részletei" />

            {activeStep && (
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Scrollbar sx={{ height: '100%' }}>
                        <Stack spacing={0} sx={{ p: 2 }}>
                            {checkoutState.items.map((item, index) => (
                                <Box key={item.id}>
                                    <SideCartItem item={item} hideControl />
                                    {index < checkoutState.items.length - 1 && (
                                        <Divider sx={{ my: 2 }} />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Scrollbar>
                </Box>
            )}

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
                        {fCurrency(getSubtotalToShow())}
                    </Typography>
                </Box>

                {getUserType() !== 'public' && getUserType() !== 'vip' && (
                    <Box sx={{ ...rowStyles }}>
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                        ÁFA
                    </Typography>
                    <Typography component="span" variant="subtitle2">
                        {fCurrency(subtotal-getSubtotalToShow())}
                    </Typography>
                </Box>
                )}

                {discount > 0 && (<Box sx={{ ...rowStyles }}>
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
                </Box>)}

                {surcharge > 0 && (
                    <Box sx={{ ...rowStyles, alignItems: 'center', display: 'flex' }}>
                        <Typography
                            component="div"
                            variant="body2"
                            sx={{ flexGrow: 1, color: 'text.secondary', display: 'flex', alignItems: 'center' }}
                        >
                            Zárolási felár
                            <Tooltip title="A végleges árat a rendelés feldolgozása után tudjuk pontosítani.">
                                <span style={{ display: 'inline-block', marginLeft: '4px', paddingTop: '4px' }}>
                                    <F2FIcons name="InfoCircle" width={18} height={18} />
                                </span>
                            </Tooltip>
                        </Typography>
                        <Typography component="span" variant="subtitle2">
                            {fCurrency(surcharge)}
                        </Typography>
                    </Box>
                )}

                {checkoutState.selectedPaymentMethod?.additionalCost != undefined &&
                    checkoutState.selectedPaymentMethod.additionalCost > 0 && (
                        <Box sx={{ ...rowStyles }}>
                            <Typography
                                component="span"
                                variant="body2"
                                sx={{ flexGrow: 1, color: 'text.secondary' }}
                            >
                                Fizetési mód felár
                            </Typography>
                            <Typography component="span" variant="subtitle2">
                                {fCurrency(checkoutState.selectedPaymentMethod.additionalCost)}
                            </Typography>
                        </Box>
                    )}

                <Box sx={{ ...rowStyles }}>
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{ flexGrow: 1, color: 'text.secondary' }}
                    >
                        Szállítás
                    </Typography>
                    <Typography
                        component="span"
                        variant="subtitle2"
                        sx={{
                            fontStyle: 'italic',
                            fontWeight: '400',
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: '#979594',
                        }}
                    >
                        {(() => {
                            if (shipping === undefined) return displayShipping;
                            return shipping === 0 ? 'Ingyenes' : fCurrency(shipping);
                        })()}
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ ...rowStyles, width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
                    <Typography component="span" variant="subtitle1" sx={{ flexGrow: 1 }}>
                        Összesen
                    </Typography>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography
                            component="span"
                            variant="subtitle1"
                            sx={{
                                display: 'block',
                                fontWeight: '600',
                                fontSize: '28px',
                                lineHeight: '40px',
                            }}
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
