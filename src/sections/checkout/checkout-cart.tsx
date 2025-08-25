import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { Alert } from '@mui/material';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { CONFIG } from 'src/global-config';
import { useGetOption } from 'src/actions/options';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useAuthContext } from 'src/auth/hooks';

import { OptionsEnum } from 'src/types/option';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutCartProductList } from './checkout-cart-product-list';
import { CheckoutCustomProductForm } from './checkout-custom-product-form';

// ----------------------------------------------------------------------

export function CheckoutCart() {
    const { user, authenticated } = useAuthContext();
    const {
        loading,
        onChangeStep,
        onDeleteCartItem,
        state: checkoutState,
        onChangeItemQuantity,
        onAddNote,
        onDeleteNote,
        onAddToCart
    } = useCheckoutContext();

    // Determine user type for minimum purchase check
    const getUserType = () => {
        if (!authenticated) return 'public';
        if (user?.user_metadata?.is_admin) return 'public'; // admin treated as public
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    };

    const userType = getUserType();
    
    // Get the appropriate minimum purchase option based on user type
    const getMinimumPurchaseOption = () => {
        switch (userType) {
            case 'vip':
                return OptionsEnum.MinimumPurchaseForVIP;
            case 'company':
                return OptionsEnum.MinimumPurchaseForCompany;
            default:
                return OptionsEnum.MinimumPurchaseForPublic;
        }
    };

    const { option: minimumPurchaseAmount } = useGetOption(getMinimumPurchaseOption());

    const isCartEmpty = !checkoutState.items.length;
    const isUnderMinimum = minimumPurchaseAmount > 0 && checkoutState.subtotal < minimumPurchaseAmount;

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

                <CheckoutCustomProductForm onAddCustomProduct={onAddToCart} />

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

                {/* Minimum Purchase Alert */}
                {!isCartEmpty && typeof(isUnderMinimum) != 'number' && isUnderMinimum && (
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mb: 2,
                            '& .MuiAlert-message': {
                                fontSize: '14px'
                            }
                        }}
                    >
                        A minimum rendelési összeg {fCurrency(minimumPurchaseAmount)}. Adj hozzá több terméket a kosárhoz a folytatáshoz!
                    </Alert>
                )}

                <Button
                    fullWidth
                    size="medium"
                    type="submit"
                    variant="contained"
                    disabled={isCartEmpty || isUnderMinimum}
                    color='primary'
                    onClick={() => onChangeStep('next')}
                >
                    Tovább a megrendeléshez
                </Button>
            </Grid>
        </Grid>
    );
}
