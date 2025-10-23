import type { ButtonProps } from '@mui/material/Button';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type DeliveryGuyOption = {
    id: number;
    name: string;
};

type Props = {
    currentDeliveryGuyId: number | null;
    deliveryGuys: DeliveryGuyOption[];
    onChangeDeliveryGuy: (newDeliveryGuyId: number | null) => void;
    color?: ButtonProps['color'];
    variant?: ButtonProps['variant'];
    disabled?: boolean;
};

export function DeliveryGuySplitButton({
    currentDeliveryGuyId,
    deliveryGuys,
    onChangeDeliveryGuy,
    color = 'inherit',
    variant = 'outlined',
    disabled = false,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current?.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuItemClick = (deliveryGuyId: number | null) => {
        onChangeDeliveryGuy(deliveryGuyId);
        setOpen(false);
    };

    const currentDeliveryGuy = deliveryGuys.find((guy) => guy.id === currentDeliveryGuyId);

    return (
        <Box>
            <Button
                ref={anchorRef}
                variant={variant}
                color={color}
                disabled={disabled}
                onClick={handleToggle}
                aria-controls={open ? 'delivery-guy-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select delivery guy"
                aria-haspopup="menu"
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
                startIcon={<Iconify icon="carbon:delivery" width={16} />}
            >
                {currentDeliveryGuy?.name || 'Nincs Futár'}
            </Button>
            <Popper
                sx={{ zIndex: 1, minWidth: anchorRef.current?.offsetWidth}}
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
                        <Paper elevation={2} sx={{padding: 1}}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="delivery-guy-menu" autoFocusItem>
                                    <MenuItem
                                        selected={currentDeliveryGuyId === null}
                                        onClick={() => handleMenuItemClick(null)}
                                    >
                                        Nincs Futár
                                    </MenuItem>
                                    {deliveryGuys.map((guy) => (
                                        <MenuItem
                                            key={guy.id}
                                            selected={guy.id === currentDeliveryGuyId}
                                            onClick={() => handleMenuItemClick(guy.id)}
                                        >
                                            {guy.name}
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
