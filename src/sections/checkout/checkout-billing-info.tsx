import type { CardProps } from '@mui/material/Card';
import type { CheckoutContextValue } from 'src/types/checkout';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';


// ----------------------------------------------------------------------

type Props = CardProps & {
    loading: CheckoutContextValue['loading'];
    checkoutState: CheckoutContextValue['state'];
    onChangeStep: CheckoutContextValue['onChangeStep'];
};

export function CheckoutBillingInfo({ checkoutState, onChangeStep, loading, sx, ...other }: Props) {
    const { billing, delivery, notificationEmails } = checkoutState;

    const renderLoading = () => (
        <Box sx={{ height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 120 }} />
        </Box>
    );

    return (
        <Card sx={[{ mb: 3 }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
            <CardHeader
                title="Szállítási cím"
            />
            <Stack spacing={1} sx={{ p: 3 }}>
                {loading ? (
                    renderLoading()
                ) : (
                    <>
                        <Box sx={{ typography: 'subtitle2' }}>
                            {`${delivery?.name} `}
                            <Box
                                component="span"
                                sx={{ color: 'text.secondary', typography: 'body2' }}
                             />
                        </Box>

                        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
                            {delivery?.fullAddress}
                        </Box>
                        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
                            {delivery?.phoneNumber}
                        </Box>
                        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
                            Értesítési e-mail címek: <br />{notificationEmails.map(email => (
                                <Box key={email} component="span" sx={{ display: 'block', pl:2 }}>
                                    {email}
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </Stack>
        </Card>
    );
}
