import type { IOrderItem } from 'src/types/order';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Tooltip, Typography } from '@mui/material';
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
import { useGetPickupLocations } from 'src/actions/pickup-location';

// ----------------------------------------------------------------------

type Props = {
    row: IOrderItem;
    selected: boolean;
    detailsHref: string;
    onSelectRow: () => void;
    onDeleteRow: () => void;
};

export function OrderTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref }: Readonly<Props>) {
    const confirmDialog = useBoolean();
    const menuActions = usePopover();
    const { locations } = useGetPickupLocations();

    const renderStatusLabel = (row: IOrderItem) => (
        <Label
            variant="soft"
            color={
                (row.status === 'completed' && 'success') ||
                (row.status === 'pending' && 'warning') ||
                (row.status === 'processing' && 'info') ||
                (row.status === 'cancelled' && 'error') ||
                'default'
            }
        >
            {(row.status === 'completed' && 'success') ||
                (row.status === 'pending' && 'Új rendelés') ||
                (row.status === 'processing' && 'Feldolgozva') ||
                (row.status === 'cancelled' && 'Visszamondva') ||
                (row.status === 'shipping' && 'Szállítás alatt') ||
                (row.status === 'delivered' && 'Kiszállítva') ||
                (row.status === 'refunded' && 'Visszatérítve') ||
                row.status
            }
        </Label>
    );

    const renderPaymentStatusLabel = (row: IOrderItem) => (
        <Label
            variant="soft"
            color={
                (row.payment.status === 'closed' && 'success') ||
                (row.payment.status === 'pending' && 'warning') ||
                (row.payment.status === 'paid' && 'info') ||
                (row.payment.status === 'failed' && 'error') ||
                'default'
            }
        >
            {(row.payment.status === 'paid' && 'Foglalva') ||
                (row.payment.status === 'pending' && 'Nincs fizetve') ||
                (row.payment.status === 'processing' && 'Feldolgozva') ||
                (row.payment.status === 'failed' && 'Sikertelen') ||
                (row.payment.status === 'closed' && 'Zárult') ||
                (row.payment.status === 'refunded' && 'Visszatérítve') ||
                row.payment.status
            }
        </Label>
    );

    const locationName = locations.find(loc => loc.postcode === row.shippingAddress?.postcode && loc.city === row.shippingAddress?.city && loc.address === (row.shippingAddress?.street))?.name || '';

    const renderMobileRows = () => (
        <TableRow hover selected={selected} >
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

            <TableCell onClick={onSelectRow} sx={{ cursor: 'pointer' }}>
                <Stack spacing={1} direction="column" width={'100%'}>
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={row.customer.userType == 'vip' ? 'VIP' : row.customer.userType == 'company' ? 'Cég' : 'Magánszemély'} arrow>
                            <span>
                                {row.customer.userType == 'vip' && <Iconify icon="eva:star-fill" width={20} height={20} color="#FFD700" name='VIP' />}
                                {row.customer.userType == 'company' && <Iconify icon="solar:buildings-3-line-duotone" width={20} height={20} color="#4CAF50" name='Cég' />}
                                {row.customer.userType == 'public' && <Iconify icon="solar:user-rounded-bold" width={20} height={20} color="#2196F3" name='Magánszemély' />}
                            </span>
                        </Tooltip>

                        <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start', width: '100%' }}>
                            <Box component="span" sx={{ color: 'text.disabled', display: { xs: 'inline-block', md: 'none' } }}>
                                <Typography variant='caption'>{fDate(row.createdAt)} {fTime(row.createdAt)}</Typography>
                            </Box>
                            <Box component="span" sx={{ fontWeight: '600' }}>{row.customer.name}</Box>

                            <Box component="span" sx={{ color: 'text.disabled', display: { xs: 'inline-block', md: 'none' } }}>
                                <Typography variant='caption'>{row.orderNumber}</Typography>
                            </Box>
                            <Stack direction="row" sx={{ width: '100%', pt: 1 }} justifyContent="space-between" spacing={2} alignItems="center">
                                {renderStatusLabel(row)}
                                {renderPaymentStatusLabel(row)}
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </TableCell>

            <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                <IconButton
                    color={menuActions.open ? 'inherit' : 'default'}
                    onClick={menuActions.onOpen}
                >
                    <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
            </TableCell>

            <TableCell> {fCurrency(row.totalAmount - row.taxes)}</TableCell>
            <TableCell> {fCurrency(row.totalAmount)} </TableCell>
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

            <TableCell align="center">
                <ListItemText
                    primary={row.delivery.shipBy}
                    secondary={locationName || ''}
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
            <TableCell align="center"> {row.payment.cardType} </TableCell>
            <TableCell align="center">
                {row.invoiceData
                    ? (
                        <Label variant='soft' color={'default'}>
                            <Link component={RouterLink} href={row.invoiceData.downloadUrl} target="_blank" underline="hover">
                                {row.invoiceData.invoiceNumber}
                            </Link>
                        </Label>
                    ) : (
                        ''
                    )
                }
            </TableCell>
        </TableRow>
    );

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

            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <Link component={RouterLink} href={detailsHref} color="inherit" underline="always" >
                    {row.orderNumber}
                </Link>
            </TableCell>

            <TableCell>
                {renderStatusLabel(row)}
            </TableCell>

            <TableCell>
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    {/*<Avatar alt={row.customer.name} src={row.customer.avatarUrl} />*/}

                    <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                        <Box component="span">{row.customer.name}</Box>

                        <Box component="span" sx={{ color: 'text.disabled' }}>
                            {row.customer.email}
                        </Box>
                        <Box component="span" sx={{ color: 'text.disabled', display: { xs: 'inline-block', md: 'none' } }}>
                            <Typography variant='caption'>{row.orderNumber}</Typography>
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

            <TableCell>
                <ListItemText
                    primary={fCurrency(row.totalAmount)}
                    secondary={fCurrency(row.totalAmount - row.taxes)}
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
            <TableCell>
                {renderPaymentStatusLabel(row)}
            </TableCell>

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

            <TableCell align="center">
                <ListItemText
                    primary={row.delivery.shipBy}
                    secondary={locationName || ''}
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
            <TableCell align="center"> {row.payment.cardType} </TableCell>
            <TableCell align="center">
                {row.invoiceData
                    ? (
                        <Label variant='soft' color={'default'}>
                            <Link component={RouterLink} href={row.invoiceData.downloadUrl} target="_blank" underline="hover">
                                {row.invoiceData.invoiceNumber}
                            </Link>
                        </Label>
                    ) : (
                        ''
                    )
                }
            </TableCell>

            <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                <IconButton
                    color={menuActions.open ? 'inherit' : 'default'}
                    onClick={menuActions.onOpen}
                >
                    <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
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
                    Törlés
                </MenuItem>

                <li>
                    <MenuItem
                        component={RouterLink}
                        href={detailsHref}
                        onClick={() => menuActions.onClose()}
                    >
                        <Iconify icon="solar:eye-bold" />
                        Megtekintés
                    </MenuItem>
                </li>
            </MenuList>
        </CustomPopover>
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content="Biztos benne, hogy törölni szeretné?"
            action={
                <Button variant="contained" color="error" onClick={onDeleteRow}>
                    Törlés
                </Button>
            }
        />
    );

    return (
        <>
            {(() => {
                const isDesktop = window.innerWidth >= 960; // md breakpoint
                return isDesktop
                    ? (
                        renderPrimaryRow()
                    )
                    : (
                        renderMobileRows()
                    );
            })()}

            {renderMenuActions()}
            {renderConfirmDialog()}
        </>
    );
}
