import type { IUserItem } from 'src/types/user';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';



// ----------------------------------------------------------------------

type Props = {
    row: IUserItem;
    selected: boolean;
    editHref: string;
    onSelectRow: () => void;
    onDeleteRow: () => void;
};

export function UserTableRow({
    row,
    selected,
    editHref,
    onSelectRow,
    onDeleteRow,
}: Readonly<Props>) {
    const menuActions = usePopover();
    const confirmDialog = useBoolean();
    
    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <li>
                    <MenuItem
                        component={RouterLink}
                        href={editHref}
                        onClick={() => menuActions.onClose()}
                    >
                        <Iconify icon="solar:pen-bold" />
                        Szerkesztés
                    </MenuItem>
                </li>

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
            </MenuList>
        </CustomPopover>
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Törlés"
            content="Biztosan törölni akarja a felhasználót?"
            action={
                <Button variant="contained" color="error" onClick={onDeleteRow}>
                    Törlés
                </Button>
            }
        />
    );

    return (
        <>
            <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
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
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar alt={row.name} src={row.avatarUrl} />

                        <Stack
                            sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}
                        >
                            <Link
                                component={RouterLink}
                                href={editHref}
                                color="inherit"
                                sx={{ cursor: 'pointer' }}
                            >
                                {row.name}
                            </Link>
                            <Box component="span" sx={{ color: 'text.disabled' }}>
                                {row.email}
                            </Box>
                        </Stack>
                    </Box>
                </TableCell>

                <TableCell align="center">
                    {row.customerData?.discountPercent && row.customerData?.discountPercent > 0 ? (
                        <Label
                            variant="soft"
                            color='default'
                        >
                            {row.customerData?.discountPercent} %
                        </Label>
                    ) : (
                        <Box sx={{ color: 'text.disabled' }}></Box>
                    )}
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                    <Label
                        variant="soft"
                        color={
                            (row.role.is_corp && 'success') ||
                            (row.role.is_vip && 'warning') ||
                            (row.role.is_admin && 'error') ||
                            'default'
                        }
                    >
                        {row.role.is_admin && 'Admin' || row.role.is_vip && 'VIP' || row.role.is_corp && 'Céges' || 'Magánszemély'}

                    </Label>
                </TableCell>

                <TableCell align="center">
                    {row.customerData?.newsletterConsent ?
                        <Iconify icon="solar:check-circle-bold" width={20} height={20} sx={{ color: 'success.main' }} />
                        :
                        <Iconify icon="solar:close-circle-bold" width={20} height={20} sx={{ color: 'error.main' }} />
                    }
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.customerData?.acquisitionSource}</TableCell>

                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color={menuActions.open ? 'inherit' : 'default'}
                            onClick={menuActions.onOpen}
                        >
                            <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>

            {renderMenuActions()}
            {renderConfirmDialog()}
        </>
    );
}
