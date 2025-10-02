import type { ButtonProps } from '@mui/material/Button';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StatusOption = {
    value: string;
    label: string;
};

type Props = {
    currentStatus: string;
    statusOptions: StatusOption[];
    onChangeStatus: (newStatus: string) => void;
    color?: ButtonProps['color'];
    variant?: ButtonProps['variant'];
    renderLabel?: (status: string) => string;
};

export function StatusSplitButton({
    currentStatus,
    statusOptions,
    onChangeStatus,
    color = 'inherit',
    variant = 'outlined',
    renderLabel,
}: Props) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const statusColors: Record<string, ButtonProps['color']> = {
        pending: 'warning',
        processing: 'primary',
        shipping: 'info',
        delivered: 'success',
        cancelled: 'error',
        refunded: 'error',
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current?.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuItemClick = (status: string) => {
        onChangeStatus(status);
        setOpen(false);
    };

    // Find the next status in the sequence
    const currentIndex = statusOptions.findIndex((opt) => opt.value === currentStatus);
    const nextStatus = statusOptions[currentIndex + 1] || statusOptions[0];

    const handleNextStatus = () => {
        if (currentIndex < statusOptions.length - 1) {
            onChangeStatus(nextStatus.value);
        }
    };

    const getDisplayLabel = (status: string) => {
        if (renderLabel) {
            return renderLabel(status);
        }
        const option = statusOptions.find((opt) => opt.value === status);
        return (option?.label || status);
    };

    // Check if we're at the last status
    const isLastStatus = currentIndex === statusOptions.length - 1;

    return (
        <Box>
            <ButtonGroup
                variant={variant}
                color={color}
                ref={anchorRef}
                aria-label="Split button for status change"
            >
                <Button
                    onClick={handleNextStatus}
                    disabled={isLastStatus}
                    color={statusColors[currentStatus] ?? color}
                    variant={variant}
                    sx={{ textTransform: 'capitalize' }}
                >
                    {isLastStatus ? getDisplayLabel(currentStatus) : getDisplayLabel(nextStatus.value)} <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
                </Button>
                <Button
                    
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select status"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                    color={statusColors[currentStatus] ?? color}
                    sx={{ px: 1, minWidth: 'auto' }}
                >
                    <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{ zIndex: 1 }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {statusOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            selected={option.value === currentStatus}
                                            onClick={() => handleMenuItemClick(option.value)}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
}
