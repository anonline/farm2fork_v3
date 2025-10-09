import { Badge, Button, useTheme, IconButton, useMediaQuery } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { useSideCart } from 'src/components/sidecart';
import F2FIcons from 'src/components/f2ficons/f2ficons';

import { useCheckoutContext } from 'src/sections/checkout/context';

export default function HeaderCartButtonMobile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { state: checkoutState } = useCheckoutContext();
    const { openSideCart, isDisabled } = useSideCart();

    // Mobile version - icon only with badge
    if (isMobile) {
        return (
            <IconButton
                onClick={openSideCart}
                disabled={isDisabled}
                sx={{ 
                    color: 'inherit',
                    p: 1,
                }}
            >
                <Badge
                    badgeContent={checkoutState.items.length}
                    color="primary"
                >
                    <F2FIcons name="Bag" width={24} height={24} style={{ color: 'inherit' }} />
                </Badge>
            </IconButton>
        );
    }

    // Desktop version - button with text and total
    return (
        <Button
            onClick={openSideCart}
            disabled={isDisabled}
            startIcon={
                <Badge
                    badgeContent={checkoutState.items.length}
                    color="primary"
                    sx={{ marginRight: '10px',
                        "& .MuiBadge-badge": {
                            backgroundColor: '#000',
                        }
                     }}
                >
                    <F2FIcons name="Bag" width={24} height={24} style={{ color: 'inherit' }} />
                </Badge>
            }
            variant={checkoutState.totalItems > 0 ? 'soft' : 'text'}
            color={checkoutState.totalItems > 0 ? 'success' : 'primary'}
            sx={{ textTransform: 'none', fontWeight: 500, color: '#262626 !important', backgroundColor: (checkoutState.totalItems > 0 ? '#e4ebc2 !important' : 'transparent') }}
        >
            {checkoutState.totalItems > 0 ? fCurrency(checkoutState.subtotal + checkoutState.surcharge) : 'KOSÁR'}
        </Button>
    );
}