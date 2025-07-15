import { Badge, Button } from "@mui/material";
import F2FIcons from "src/components/f2ficons/f2ficons";
import { paths } from "src/routes/paths";
import { useCheckoutContext } from "src/sections/checkout/context";
import { fCurrency } from "src/utils/format-number";

export default function HeaderCartButton() {
const { state:checkoutState,  } = useCheckoutContext();
    return (
        <Button
            href={paths.product.checkout}
            startIcon={
                <Badge badgeContent={checkoutState.totalItems} color='primary' sx={{marginRight: '10px'}}>
                    <F2FIcons
                        name="Bag"
                        width={24}
                        height={24}
                        style={{ color: 'inherit' }}
                    />
                </Badge>
            }
            variant={checkoutState.totalItems > 0 ? 'soft' : "text"}
            color={checkoutState.totalItems > 0 ? 'success' : 'primary' }
            sx={{ textTransform: 'none', fontWeight: 500, color: '#262626 !important' }}
        >
            {checkoutState.totalItems >0 ? fCurrency(checkoutState.subtotal) : 'Kosár'}
        </Button>
    );

}