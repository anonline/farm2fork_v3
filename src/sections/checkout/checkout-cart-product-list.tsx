import type { CheckoutContextValue } from 'src/types/checkout';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { Scrollbar } from 'src/components/scrollbar';

import { CheckoutCartProduct } from './checkout-cart-product';

// ----------------------------------------------------------------------

type Props = {
    checkoutState: CheckoutContextValue['state'];
    onDeleteCartItem: CheckoutContextValue['onDeleteCartItem'];
    onChangeItemQuantity: CheckoutContextValue['onChangeItemQuantity'];
    onAddNote: CheckoutContextValue['onAddNote'];
    onDeleteNote: CheckoutContextValue['onDeleteNote'];
};

export function CheckoutCartProductList({
    checkoutState,
    onDeleteCartItem,
    onChangeItemQuantity,
    onAddNote,
    onDeleteNote,
}: Readonly<Props>) {
    return (
        <Scrollbar>
            <Table sx={{ minWidth: '100%' }}>
                <TableBody>
                    {checkoutState.items.map((row) => (
                        <CheckoutCartProduct
                            key={row.id}
                            row={row}
                            onDeleteCartItem={onDeleteCartItem}
                            onChangeItemQuantity={onChangeItemQuantity}
                            onAddNote={onAddNote}
                            onDeleteNote={onDeleteNote}
                        />
                    ))}
                </TableBody>
            </Table>
        </Scrollbar>
    );
}
