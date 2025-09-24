import type { IOrderItem } from 'src/types/order';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
    row: IOrderItem;
    selected: boolean;
    detailsHref: string;
    onSelectRow: () => void;
    onDeleteRow: () => void;
};

export function OrderTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref }: Props) {
    const confirmDialog = useBoolean();
    const menuActions = usePopover();
    const collapseRow = useBoolean();
    
    const renderPrimaryRow = () => (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox
                    checked={selected}
                    onClick={onSelectRow}
                    slotProps={{
                        input: {
                            id: `${row.id}-checkbox`,
                            'aria-label': `${row.id} checkbox`,
                        },
                    }}
                />
            </TableCell>

            <TableCell>
                <Link component={RouterLink} href={detailsHref} color="inherit" underline="always">
                    {row.orderNumber}
                </Link>
            </TableCell>

            <TableCell>
                <Label
                    variant="soft"
                    color={
                        (row.status === 'completed' && 'success') ||
                        (row.status === 'pending' && 'warning') ||
                        (row.status === 'inprogress' && 'info') ||
                        (row.status === 'cancelled' && 'error') ||
                        'default'
                    }
                >
                    {(row.status === 'completed' && 'success') ||
                        (row.status === 'pending' && 'Új rendelés') ||
                        (row.status === 'processing' || row.status === 'inprogress' && 'Feldolgozva') ||
                        (row.status === 'cancelled' && 'Visszamondva') ||
                        (row.status === 'shipping' && 'Szállítás alatt') ||
                        (row.status === 'delivered' && 'Kiszállítva') ||
                        (row.status === 'refunded' && 'Visszatérítve') ||
                        row.status
                    }
                </Label>
            </TableCell>

            <TableCell>
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    {/*<Avatar alt={row.customer.name} src={row.customer.avatarUrl} />*/}

                    <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                        <Box component="span">{row.customer.name}</Box>

                        <Box component="span" sx={{ color: 'text.disabled' }}>
                            {row.customer.email}
                        </Box>
                    </Stack>
                </Box>
            </TableCell>

            <TableCell align="center">
                <Tooltip title={row.customer.userType == 'vip' ? 'VIP' : row.customer.userType == 'company' ? 'Cég' : 'Magánszemély'} arrow>
                    <span>
                        {row.customer.userType == 'vip' && <Iconify icon="eva:star-fill" width={20} height={20} color="#FFD700" name='VIP' />}
                        {row.customer.userType == 'company' && <Iconify icon="solar:buildings-3-line-duotone" width={20} height={20} color="#4CAF50" name='Cég' />}
                        {row.customer.userType == 'public' && <Iconify icon="solar:user-rounded-bold" width={20} height={20} color="#2196F3" name='Magánszemély' />}
                    </span>
                </Tooltip>
            </TableCell>

            <TableCell> {fCurrency(row.totalAmount-row.taxes)}</TableCell>
            <TableCell> {fCurrency(row.totalAmount)} </TableCell>

            <TableCell>
                <ListItemText
                    primary={fDate(row.createdAt)}
                    secondary={fTime(row.createdAt, "HH:mm")}
                    slotProps={{
                        primary: {
                            noWrap: true,
                            sx: { typography: 'body2' },
                        },
                        secondary: {
                            sx: { mt: 0.5, typography: 'caption' },
                        },
                    }}
                />
            </TableCell>

            <TableCell align="center">
                <ListItemText
                    primary={fDate(row.planned_shipping_date_time)}
                    secondary={row.shipment_time || ''}
                    slotProps={{
                        primary: {
                            noWrap: true,
                            sx: { typography: 'body2' },
                        },
                        secondary: {
                            sx: { mt: 0.5, typography: 'caption' },
                        },
                    }}
                />
            </TableCell>

            <TableCell align="center"> {row.delivery.shipBy} </TableCell>
            <TableCell align="center"> {row.payment.cardType} </TableCell>

            <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                <IconButton
                    color={collapseRow.value ? 'inherit' : 'default'}
                    onClick={collapseRow.onToggle}
                    sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
                >
                    <Iconify icon="eva:arrow-ios-downward-fill" />
                </IconButton>

                <IconButton
                    color={menuActions.open ? 'inherit' : 'default'}
                    onClick={menuActions.onOpen}
                >
                    <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
            </TableCell>
        </TableRow>
    );

    const renderSecondaryRow = () => (
        <TableRow>
            <TableCell sx={{ p: 0, border: 'none' }} colSpan={11}>
                <Collapse
                    in={collapseRow.value}
                    timeout="auto"
                    unmountOnExit
                    sx={{ bgcolor: 'background.neutral' }}
                >
                    <Paper sx={{ m: 1.5 }}>
                        {row.items.map((item) => (
                            <Box
                                key={item.id}
                                sx={(theme) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: theme.spacing(1.5, 2, 1.5, 1.5),
                                    '&:not(:last-of-type)': {
                                        borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                                    },
                                })}
                            >
                                <Avatar
                                    src={item.coverUrl}
                                    variant="rounded"
                                    sx={{ width: 48, height: 48, mr: 2 }}
                                />

                                <ListItemText
                                    primary={item.name}
                                    secondary={`${fCurrency(item.netPrice)} / ${item.unit}`}
                                    slotProps={{
                                        primary: {
                                            sx: { typography: 'body2' },
                                        },
                                        secondary: {
                                            sx: { mt: 0.5, color: 'text.disabled' },
                                        },
                                    }}
                                />

                                <div>x{item.quantity}</div>

                                <Box sx={{ width: 110, textAlign: 'right' }}>
                                    {fCurrency(item.subtotal)}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Collapse>
            </TableCell>
        </TableRow>
    );

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem
                    onClick={() => {
                        confirmDialog.onTrue();
                        menuActions.onClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Delete
                </MenuItem>

                <li>
                    <MenuItem
                        component={RouterLink}
                        href={detailsHref}
                        onClick={() => menuActions.onClose()}
                    >
                        <Iconify icon="solar:eye-bold" />
                        View
                    </MenuItem>
                </li>
            </MenuList>
        </CustomPopover>
    );

    const renderConfrimDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Delete"
            content="Are you sure want to delete?"
            action={
                <Button variant="contained" color="error" onClick={onDeleteRow}>
                    Delete
                </Button>
            }
        />
    );

    return (
        <>
            {renderPrimaryRow()}
            {renderSecondaryRow()}
            {renderMenuActions()}
            {renderConfrimDialog()}
        </>
    );
}
