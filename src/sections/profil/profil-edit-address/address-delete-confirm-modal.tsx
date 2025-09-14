import type { IAddress } from 'src/types/address';

import {
    Box,
    Stack,
    Button,
    Dialog,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import F2FIcons from 'src/components/f2ficons/f2ficons';

interface AddressDeleteConfirmModalProps {
    open: boolean;
    address: IAddress;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function AddressDeleteConfirmModal({
    open,
    address,
    onConfirm,
    onCancel,
}: AddressDeleteConfirmModalProps) {
    const addressTypeText = address.type === 'shipping' ? 'szállítási' : 'számlázási';

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 1,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'error.light',
                            color: 'error.main',
                        }}
                    >
                        <F2FIcons name="Delete" width={24} height={24} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                        Cím törlése
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ py: 2 }}>
                <Stack spacing={2}>
                    <Typography>
                        Biztosan törölni szeretnéd ezt a {addressTypeText} címet?
                    </Typography>
                    
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'grey.200',
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            {address.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {address.postcode} {address.city}, {address.street} {address.houseNumber}
                            {address.type === 'shipping' && address.floor && `, ${address.floor}`}
                        </Typography>
                        {address.phone && (
                            <Typography variant="body2" color="text.secondary">
                                {address.phone}
                            </Typography>
                        )}
                        {address.companyName && (
                            <Typography variant="body2" color="text.secondary">
                                {address.companyName}
                            </Typography>
                        )}
                    </Box>

                    {address.isDefault && (
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1,
                                backgroundColor: 'warning.light',
                                border: '1px solid',
                                borderColor: 'warning.main',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <F2FIcons name="Warning" width={16} height={16} />
                                <Typography variant="body2" fontWeight={500}>
                                    Ez az alapértelmezett {addressTypeText} cím.
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Ez a művelet nem vonható vissza.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        borderColor: 'grey.300',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'grey.400',
                            backgroundColor: 'grey.50',
                        },
                    }}
                >
                    Mégse
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    startIcon={<F2FIcons name="Delete" width={16} height={24} style={{ display: 'flex', alignItems: 'center' }} />}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'error.dark',
                        },
                    }}
                >
                    Törlés
                </Button>
            </DialogActions>
        </Dialog>
    );
}