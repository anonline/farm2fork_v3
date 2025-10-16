import type { ICheckoutItem, CheckoutContextValue } from 'src/types/checkout';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import F2FIcons from 'src/components/f2ficons/f2ficons';
import { NumberInput } from 'src/components/number-input';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';

// ----------------------------------------------------------------------

type Props = {
    row: ICheckoutItem;
    onDeleteCartItem: CheckoutContextValue['onDeleteCartItem'];
    onChangeItemQuantity: CheckoutContextValue['onChangeItemQuantity'];
    onAddNote: CheckoutContextValue['onAddNote'];
    onDeleteNote: CheckoutContextValue['onDeleteNote'];
};

export function CheckoutCartProduct({
    row,
    onDeleteCartItem,
    onChangeItemQuantity,
    onAddNote,
    onDeleteNote,
}: Readonly<Props>) {
    const { user } = useAuthContext();
    const [showNoteField, setShowNoteField] = useState(false);
    const [noteText, setNoteText] = useState(row.note || '');

    const handleToggleNote = () => {
        setShowNoteField(!showNoteField);
    };

    const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNoteText(event.target.value);
    };

    const handleNoteSubmit = () => {
        if (noteText.trim()) {
            onAddNote(row.id, noteText.trim());
        } else {
            onDeleteNote(row.id);
        }
        setShowNoteField(false);
    };

    const handleNoteKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleNoteSubmit();
        }
        if (event.key === 'Escape') {
            setNoteText(row.note || '');
            setShowNoteField(false);
        }
    };

    const getUserType = () => {
        if (user?.user_metadata?.is_vip) return 'vip';
        if (user?.user_metadata?.is_corp) return 'company';
        return 'public';
    };

    const getPriceToShow = () => {
        const userType = getUserType();
        switch (userType) {
            case 'vip':
            case 'company':
                return row.netPrice;
            default:
                return row.grossPrice;
        }
    };

    const getSubtotalToShow = () => getPriceToShow() * row.quantity;

    return (
        <>
            <TableRow sx={{ display: { xs: 'none', md: 'table-row' } }}>
                <TableCell>
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            variant="rounded"
                            alt={row.name}
                            src={
                                row.coverUrl ||
                                'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'
                            }
                            sx={{ width: 100, height: 100 }}
                        />

                        <Stack spacing={1} sx={{ flex: 1 }}>
                            <Typography
                                noWrap
                                sx={{
                                    maxWidth: 240,
                                    fontWeight: 700,
                                    fontSize: '18px',
                                    lineHeight: '28px',
                                    color: '#262626',
                                }}
                            >
                                {row.name}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    lineHeight: '24px',
                                    color: '#7e7e7e',
                                }}
                            >
                                {fCurrency(getPriceToShow())}/{row.unit ?? 'db'}
                            </Typography>

                            <Box
                                sx={{
                                    width: 150,
                                    gap: '8px',
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <NumberInput
                                    hideDivider
                                    digits={1}
                                    value={Number(row.quantity.toFixed(1))}
                                    onChange={(event, quantity: number) =>
                                        onChangeItemQuantity(row.id, quantity)
                                    }
                                    min={row.minQuantity || 1}
                                    max={row.maxQuantity || row.available}
                                    step={row.stepQuantity || 1}
                                />

                                <IconButton onClick={() => onDeleteCartItem(row.id)}>
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>

                            </Box>

                            <Collapse in={showNoteField}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Megjegyzés hozzáadása..."
                                    value={noteText}
                                    onChange={handleNoteChange}
                                    onKeyDown={handleNoteKeyPress}
                                    onBlur={handleNoteSubmit}
                                    autoFocus
                                    sx={{
                                        mt: 1,
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                            </Collapse>
                        </Stack>
                    </Box>
                </TableCell>

                <TableCell align="right" sx={{ px: 3 }}>
                    <Stack spacing={1}>
                        <Typography>{fCurrency(getSubtotalToShow())}</Typography>
                        <Box>
                            <IconButton onClick={handleToggleNote}>
                                <F2FIcons
                                    name={row.note ? 'CommentOn' : 'CommentAdd'}
                                    width={20}
                                    height={20}
                                />
                            </IconButton>
                        </Box>
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Mobile view */}
            <TableRow sx={{ display: { xs: 'table-row', md: 'none' } }}>
                <TableCell>
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                            variant="rounded"
                            alt={row.name}
                            src={
                                row.coverUrl ||
                                'https://qg8ssz19aqjzweso.public.blob.vercel-storage.com/images/product/placeholder.webp'
                            }
                            sx={{ width: 100, height: 100 }}
                        />

                        <Stack spacing={1} sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography
                                    noWrap
                                    sx={{
                                        maxWidth: 240,
                                        fontWeight: 700,
                                        fontSize: '18px',
                                        lineHeight: '28px',
                                        color: '#262626',
                                    }}
                                >
                                    {row.name}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        lineHeight: '24px',
                                        color: '#7e7e7e',
                                    }}
                                >
                                    {fCurrency(getPriceToShow())}/{row.unit ?? 'db'}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontWeight: '600', fontSize: '18px', lineHeight: '28px', color: '#262626' }}>{fCurrency(getSubtotalToShow())}</Typography>

                            <Box
                                sx={{
                                    width: '100%',
                                    gap: 2,
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <NumberInput
                                    hideDivider
                                    digits={1}
                                    value={Number(row.quantity.toFixed(1))}
                                    onChange={(event, quantity: number) =>
                                        onChangeItemQuantity(row.id, quantity)
                                    }
                                    min={row.minQuantity || 1}
                                    max={row.maxQuantity || row.available}
                                    step={row.stepQuantity || 1}
                                    sx={{flexGrow: 1}}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                    <IconButton onClick={() => onDeleteCartItem(row.id)}>
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>

                                    <IconButton onClick={handleToggleNote} sx={{ mt: '-7px' }}>
                                        <F2FIcons
                                            name={row.note ? 'CommentOn' : 'CommentAdd'}
                                            width={20}
                                            height={20}
                                        />
                                    </IconButton>
                                </Box>
                            </Box>

                            
                        </Stack>
                    </Box>
                    <Collapse in={showNoteField}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Megjegyzés hozzáadása..."
                                    value={noteText}
                                    onChange={handleNoteChange}
                                    onKeyDown={handleNoteKeyPress}
                                    onBlur={handleNoteSubmit}
                                    autoFocus
                                    sx={{
                                        mt: 1,
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                            </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
