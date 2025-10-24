import { useState } from 'react';

import {
    Grid,
    Stack,
    Dialog,
    Button,
    Checkbox,
    useTheme,
    Typography,
    DialogContent,
    DialogActions,
    useMediaQuery,
    FormControlLabel,
} from '@mui/material';

import { CONFIG } from 'src/global-config';

import { Image } from '../image';

// ----------------------------------------------------------------------

type PaymentInfoModalProps = Readonly<{
    open: boolean;
    onClose: () => void;
    surchargePercent: number;
}>;

const STORAGE_KEY = 'payment-info-modal-dismissed';

export function PaymentInfoModal({ open, onClose, surchargePercent }: PaymentInfoModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);

    const handleClose = () => {
        if (doNotShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
        onClose();
    };

    const modalData = [
        {
            title: 'Fizetés',
            description: `Fizetéskor a teljes árat és plusz ${surchargePercent}%-ot lefoglalunk a kártyádon`,
            illustration: {
                src: CONFIG.assetsDir + '/illustrations/simple/simplemodal1.png',
                alt: 'Fizetés',
                style: {
                    height: { xs: '50px', md: '100px' },
                    //maxHeight: '100px',
                }
            },
        },
        {
            title: 'Feldolgozás',
            description: `Az áru összekészítésekor felmérjük a súlyeltérések okozta különbözetet`,
            illustration: {
                src: CONFIG.assetsDir + '/illustrations/simple/simplemodal2.png',
                alt: 'Feldolgozás',
                style: {
                    height: { xs: '50px', md: '100px' },
                    maxHeight: '100px'
                }
            },
        },
        {
            title: 'Különbözet feloldása',
            description: `A feldolgozó email-el együtt a fennmaradó összeget feloldjuk a számládon`,
            illustration: {
                src: CONFIG.assetsDir + '/illustrations/simple/simplemodal3.png',
                alt: 'Különbözet feloldása',
                style: {
                    height: { xs: '50px', md: '100px' },
                    maxHeight: '100px'
                }
            },
        },
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={isMobile ? false : 'md'}
            fullWidth={!isMobile}
            fullScreen={isMobile}
            slotProps={{
                paper: {
                    elevation: 3,
                    sx: {
                        bgcolor: 'background.paper',
                        ...(isMobile && {
                            m: 0,
                            maxHeight: '100%',
                            width: '100%',
                        }),
                    },
                },
            }}
        >
            <DialogContent sx={{ p: 6, ...(isMobile && { p: 3 }) }}>
                {/* Title */}
                <Typography
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        fontWeight: 600,
                        fontSize: '24px',
                        lineHeight: '36px',
                        ...(isMobile && { mb: 3, fontSize: '1.25rem' }),
                    }}
                >
                    Bankártyás fizetés menete
                </Typography>

                {/* Content Grid */}
                <Grid
                    container
                    spacing={isMobile ? 3 : 6}
                    sx={{
                        ...(isMobile && {
                            flexDirection: 'column',
                        }),
                    }}
                >
                    {modalData.map((item) => (
                        <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                            <Stack
                                
                                sx={{
                                    textAlign: 'center',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    src={item.illustration.src}
                                    alt={item.illustration.alt}
                                    sx={item.illustration.style}
                                    slotProps={{
                                        img:{
                                            style:{objectFit:'contain'}
                                        }
                                    }}
                                />
                                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                                    {item.description}
                                </Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    pt: 0,
                    alignItems: isMobile ? 'center' : 'center',
                    justifyContent: 'center',
                }}
            >

                {/* Close button */}
                <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                    fullWidth={isMobile}
                    size="medium"
                    sx={{
                        minWidth: 150,
                        ...(isMobile && {
                            width: '100%',
                        }),
                    }}
                >
                    Rendben
                </Button>


                {/* Do not show again checkbox */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={doNotShowAgain}
                            onChange={(e) => setDoNotShowAgain(e.target.checked)}
                        />
                    }
                    label={
                        <Typography variant="body2" color="text.secondary">
                            Ne mutassa újra
                        </Typography>
                    }
                />


            </DialogActions>
        </Dialog>
    );
}

// Helper function to check if modal should be shown
export function shouldShowPaymentInfoModal(): boolean {
    if (globalThis.window === undefined) return false;
    return localStorage.getItem(STORAGE_KEY) !== 'true';
}

// Helper function to reset the modal (useful for testing or user preference reset)
export function resetPaymentInfoModal(): void {
    if (globalThis.window === undefined) return;
    localStorage.removeItem(STORAGE_KEY);
}
