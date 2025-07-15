import type { ICheckoutItem, CheckoutContextValue } from 'src/types/checkout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import F2FIcons from 'src/components/f2ficons/f2ficons';
import { NumberInput } from 'src/components/number-input';

// ----------------------------------------------------------------------

type Props = {
    row: ICheckoutItem;
    onDeleteCartItem: CheckoutContextValue['onDeleteCartItem'];
    onChangeItemQuantity: CheckoutContextValue['onChangeItemQuantity'];
    onAddNote: CheckoutContextValue['onAddNote'];
    onDeleteNote: CheckoutContextValue['onDeleteNote'];
};

export function CheckoutCartProduct({ row, onDeleteCartItem, onChangeItemQuantity, onAddNote, onDeleteNote }: Readonly<Props>) {
    return (
        <TableRow>
            <TableCell>
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        variant="rounded"
                        alt={row.name}
                        src={row.coverUrl}
                        sx={{ width: 100, height: 100 }}
                    />

                    <Stack spacing={1}>
                        <Typography noWrap sx={{ maxWidth: 240, fontWeight: 700, fontSize: '18px', lineHeight: '28px', color: '#262626' }}>
                            {row.name}
                        </Typography>

                        <Typography sx={{ fontSize: '16px', fontWeight: '500', lineHeight: '24px', color: '#7e7e7e' }}>
                            {fCurrency(row.price)}/{row.unit ?? 'db'}
                        </Typography>

                        <Box sx={{ width: 150, gap: '8px', textAlign: 'right', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <NumberInput
                                hideDivider
                                value={row.quantity}
                                onChange={(event, quantity: number) =>
                                    onChangeItemQuantity(row.id, quantity)
                                }
                                max={row.available}
                            />

                            <IconButton onClick={() => onDeleteCartItem(row.id)}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                        </Box>
                    </Stack>
                </Box>
            </TableCell>

            <TableCell align="right" sx={{ px: 1 }}>
                <Stack spacing={1}>
                    <Typography>
                        {fCurrency(row.subtotal)}
                    </Typography>
                    <Box>
                        <IconButton>
                            <F2FIcons name="CommentAdd" width={20} height={20}/>
                        </IconButton>
                    </Box>
                </Stack>

            </TableCell>
        </TableRow>
    );
}
