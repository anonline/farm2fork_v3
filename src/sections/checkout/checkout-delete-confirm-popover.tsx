import type { PopoverOrigin } from '@mui/material/Popover';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
};

export function CheckoutDeleteConfirmPopover({
    open,
    anchorEl,
    onClose,
    onConfirm,
    productName,
}: Props) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            } as PopoverOrigin}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            } as PopoverOrigin}
            slotProps={{
                paper: {
                    sx: {
                        p: 2,
                        maxWidth: 320,
                        borderRadius: 2,
                        boxShadow: (theme) =>
                            theme.palette.mode === 'light'
                                ? '0px 4px 20px rgba(0, 0, 0, 0.1)'
                                : '0px 4px 20px rgba(0, 0, 0, 0.5)',
                    },
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: 'text.primary',
                    }}
                >
                    Biztosan eltávolítod?
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'text.secondary',
                    }}
                >
                    {productName}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            minWidth: 80,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Mégse
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={handleConfirm}
                        sx={{
                            minWidth: 80,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Törlés
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
}
