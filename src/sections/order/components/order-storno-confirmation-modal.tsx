import type { DialogProps } from '@mui/material/Dialog';

import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = DialogProps & {
    onConfirm: () => Promise<void>;
    invoiceNumber?: string;
    loading?: boolean;
};

export function OrderStornoConfirmationModal({ 
    open, 
    onClose, 
    onConfirm, 
    invoiceNumber,
    loading = false,
    ...other 
}: Props) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
            onClose?.({}, 'backdropClick');
        } catch (error) {
            console.error('Error during storno confirmation:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = loading || isProcessing;

    return (
        <Dialog
            open={open}
            onClose={isLoading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            {...other}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:pen-bold" />
                    Számla sztornózása
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Biztosan sztornózni szeretné a számlát?
                </Typography>

                {invoiceNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Számla száma: <strong>{invoiceNumber}</strong>
                    </Typography>
                )}

                <Typography variant="body2" color="warning.main" sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1,
                    p: 2,
                    bgcolor: 'warning.lighter',
                    borderRadius: 1
                }}>
                    <Iconify icon="solar:lock-password-outline" sx={{ mt: 0.125, flexShrink: 0 }} />
                    <span>
                        A sztornó után a rendeléshez új számla generálható lesz. 
                        A sztornó folyamat visszavonhatatlan!
                    </span>
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                    onClick={(event) => onClose?.(event, 'backdropClick')}
                    disabled={isLoading}
                >
                    Mégse
                </Button>

                <Button
                    variant="contained"
                    color="error"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    startIcon={
                        isLoading ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <Iconify icon="solar:pen-bold" />
                        )
                    }
                >
                    {isLoading ? 'Sztornózás...' : 'Számla sztornózása'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}