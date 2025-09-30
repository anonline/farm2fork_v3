'use client';

import { useRef, useEffect } from 'react';
import { Box, Badge } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';
import { fetchGetProductsByIds } from 'src/actions/product';

import F2FIcons from 'src/components/f2ficons/f2ficons';

import { CheckoutCart } from '../checkout-cart';
import { useCheckoutContext } from '../context';
import { CheckoutPayment } from '../checkout-payment';
import { CheckoutOrderComplete } from '../checkout-order-complete';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

export function CheckoutView() {
    const { user, authenticated } = useAuthContext();
    const { state: checkoutState, activeStep, completed, onResetCart, onDeleteCartItem } = useCheckoutContext();
    const validatedItemsRef = useRef(new Set<string>());

    // Validate cart items based on user permissions
    useEffect(() => {
        const validateCartItems = async () => {
            // Only validate if user is authenticated and cart has items
            if (!authenticated || !checkoutState.items.length) {
                return;
            }

            try {
                // Get unique product IDs from cart that haven't been validated yet
                const productIds = [...new Set(checkoutState.items.map(item => item.id))];
                const itemsToValidate = productIds.filter(id => !validatedItemsRef.current.has(id));
                
                if (!itemsToValidate.length) {
                    return; // All items already validated
                }
                
                // Fetch products from database
                const { products, error } = await fetchGetProductsByIds(itemsToValidate);
                
                if (error) {
                    console.error('Error fetching products for validation:', error);
                    return;
                }

                // Check user permissions
                const isVip = user?.user_metadata?.is_vip || false;
                const isCorp = user?.user_metadata?.is_corp || false;

                // Validate each cart item
                checkoutState.items.forEach(cartItem => {
                    const product = products.find(p => p.id.toString() === cartItem.id.toString());
                    
                    if (product && !validatedItemsRef.current.has(cartItem.id)) {
                        let shouldRemove = false;

                        // Check if user has access to this product
                        if (isVip && !product.isVip) {
                            shouldRemove = true;
                        } else if (isCorp && !product.isCorp) {
                            shouldRemove = true;
                        } else if (!isVip && !isCorp && !product.isPublic) {
                            shouldRemove = true;
                        }

                        // Mark item as validated
                        validatedItemsRef.current.add(cartItem.id);

                        // Remove unauthorized product from cart
                        if (shouldRemove) {
                            console.log(`Removing unauthorized product from cart: ${product.name}`);
                            toast.error(`A kosarában szereplő "${product.name}" termékhez nincs jogosultsága. Eltávolítottuk a kosárból.`);
                            onDeleteCartItem(cartItem.id);
                        }
                    }
                });

            } catch (error) {
                console.error('Error validating cart items:', error);
            }
        };

        validateCartItems();
    }, [authenticated, user?.user_metadata?.is_vip, user?.user_metadata?.is_corp, checkoutState.items.length, onDeleteCartItem]);

    // Clean up validated items ref when cart is empty
    useEffect(() => {
        if (checkoutState.items.length === 0) {
            validatedItemsRef.current.clear();
        }
    }, [checkoutState.items.length]);

    return (
        <Container sx={{ mb: 10 }}>
            {activeStep != 1 && (<Box sx={{ gap: 2, display: 'flex', alignItems: 'center', my: 2 }}>
                <Badge badgeContent={checkoutState.items.length} color="primary">
                    <F2FIcons name="Bag" width={32} height={32} style={{ marginTop: '-5px' }} />
                </Badge>
                
                <Typography
                    sx={{
                        fontSize: '32px',
                        fontWeight: '700',
                        lineHeight: '44px',
                        color: '#262626',
                        textTransform: 'upperCase',
                    }}
                >
                    Termékek
                </Typography>
            </Box>)}

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
                        onDownloadPDF={() => {}}
                    />
                )}
            </>
        </Container>
    );
}
