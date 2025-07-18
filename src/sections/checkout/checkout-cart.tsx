import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { Alert } from '@mui/material';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutCartProductList } from './checkout-cart-product-list';

// ----------------------------------------------------------------------

export function CheckoutCart() {
    const {
        loading,
        onChangeStep,
        onDeleteCartItem,
        state: checkoutState,
        onChangeItemQuantity,
        onAddNote,
        onDeleteNote
    } = useCheckoutContext();

    const isCartEmpty = !checkoutState.items.length;

    const renderLoading = () => (
        <Box
            sx={{
                height: 340,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 320 }} />
        </Box>
    );

    const renderEmpty = () => (
        <EmptyContent
            title="Cart is empty!"
            description="Look like you have no items in your shopping cart."
            imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-cart.svg`}
            sx={{ height: 340 }}
        />
    );

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
                <Card sx={{ mb: 3 }}>
                    <CardHeader
                        title={
                            <Alert severity="info" sx={{ mb: 2 }}>Hiba üzik </Alert>
                        }
                        sx={{ mb: 3 }}
                    />

                    {loading ? (
                        renderLoading()
                    ) : (
                        <>
                            {isCartEmpty ? (
                                renderEmpty()
                            ) : (
                                <CheckoutCartProductList
                                    checkoutState={checkoutState}
                                    onDeleteCartItem={onDeleteCartItem}
                                    onChangeItemQuantity={onChangeItemQuantity}
                                    onAddNote={onAddNote}
                                    onDeleteNote={onDeleteNote}
                                />
                            )}
                        </>
                    )}
                </Card>

                <Button
                    component={RouterLink}
                    href={paths.product.root}
                    color="inherit"
                    startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                >
                    Vásárlás folytatása
                </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }} sx={{backgroundColor: '#F8F8F8', padding: '24px'}}>
                <CheckoutSummary checkoutState={checkoutState} />

                <Button
                    fullWidth
                    size="medium"
                    type="submit"
                    variant="contained"
                    disabled={isCartEmpty}
                    color='primary'
                    onClick={() => onChangeStep('next')}
                >
                    Tovább a megrendeléshez
                </Button>
            </Grid>
        </Grid>
    );
}
