import type { CheckoutContextValue } from 'src/types/checkout';
import type { TableHeadCellProps } from 'src/components/table';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { Scrollbar } from 'src/components/scrollbar';

import { CheckoutCartProduct } from './checkout-cart-product';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'product', label: 'Product' },
    { id: 'price', label: 'Price' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'totalAmount', label: 'Total Price', align: 'right' },
    { id: '' },
];

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
