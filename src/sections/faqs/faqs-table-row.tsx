import type { IFaqItem } from 'src/types/faq'

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
    row: IFaqItem;
    selected: boolean;
    detailsHref: string;
    onSelectRow: () => void;
    onDeleteRow: () => void;
};

export function FaqTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref }: Props) {
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
                    {row.id}
                </Link>
            </TableCell>

            <TableCell>
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    
                    <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                        <Box component="span">{row.question}</Box>
                    </Stack>
                </Box>
            </TableCell>

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
            <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
                <Collapse
                    in={collapseRow.value}
                    timeout="auto"
                    unmountOnExit
                    sx={{ bgcolor: 'background.neutral' }}
                >
                    <Paper sx={{ m: 1.5 }}>
                            <Box
                                key={row.id}
                                sx={(theme) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: theme.spacing(1.5, 2, 1.5, 1.5),
                                    '&:not(:last-of-type)': {
                                        borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                                    },
                                })}
                            >
                                <ListItemText
                                    primary={row.answer}
                                    slotProps={{
                                        primary: {
                                            sx: { typography: 'body2' },
                                        },
                                        secondary: {
                                            sx: { mt: 0.5, color: 'text.disabled' },
                                        },
                                    }}
                                />
                            </Box>
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
