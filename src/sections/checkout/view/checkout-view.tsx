'use client';

import { Box, Badge } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import F2FIcons from 'src/components/f2ficons/f2ficons';

import { CheckoutCart } from '../checkout-cart';
import { useCheckoutContext } from '../context';
import { CheckoutPayment } from '../checkout-payment';
import { CheckoutOrderComplete } from '../checkout-order-complete';

// ----------------------------------------------------------------------

export function CheckoutView() {
    const { state:checkoutState, activeStep, completed, onResetCart } = useCheckoutContext();

    return (
        <Container sx={{ mb: 10 }}>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', my: 2 }}>

                <Badge badgeContent={checkoutState.items.length} color="primary">
                    <F2FIcons name='Bag' width={32} height={32} style={{ marginTop: '-5px' }} />
                </Badge>
                <Typography sx={{ fontSize: '32px', fontWeight: '700', lineHeight: '44px', color: '#262626', textTransform: 'upperCase' }}>Termékek</Typography>
            </Box>

            {/*<Grid container justifyContent={completed ? 'center' : 'flex-start'}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <CheckoutSteps steps={steps} activeStep={activeStep ?? 0} />
                </Grid>
            </Grid>*/}

            <>
                {(activeStep === 0 || activeStep === undefined) && <CheckoutCart />}

                {/*activeStep === 1 && <CheckoutBillingAddress />*/}

                {activeStep === 1 && <CheckoutPayment />}

                {completed && (
                    <CheckoutOrderComplete
                        open
                        onResetCart={onResetCart}
                        onDownloadPDF={() => { }}
                    />
                )}
            </>
        </Container>
    );
}
