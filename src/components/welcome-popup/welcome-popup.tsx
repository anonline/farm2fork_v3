'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

import { themeConfig } from 'src/theme';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const COOKIE_NAME = 'farm2fork_welcome_shown';

// Helper function to get cookie value
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 365) {
    if (typeof document === 'undefined') return;
    
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

export function WelcomePopup() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show on dashboard pages
        if (pathname?.startsWith('/dashboard')) {
            return undefined;
        }

        // Check if the popup has been shown before (using cookie)
        const hasBeenShown = getCookie(COOKIE_NAME);
        
        if (!hasBeenShown) {
            // Delay popup by 1 second for better UX
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
        return undefined;
    }, [pathname]);

    const handleClose = () => {
        setOpen(false);
        // Mark as shown in cookie (persists for 1 year)
        setCookie(COOKIE_NAME, 'true', 365);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    color: 'common.white',
                    '&:hover': {
                        backgroundColor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.1),
                    },
                }}
            >
                <Iconify icon="mingcute:close-line" />
            </IconButton>

            <DialogContent
                sx={{
                    p: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Header with gradient background */}
                <Box
                    sx={[
                        (theme) => ({
                            ...theme.mixins.bgGradient({
                                images: [
                                    `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
                                ],
                            }),
                            position: 'relative',
                            pt: 6,
                            pb: 4,
                            px: 4,
                            color: 'common.white',
                            textAlign: 'center',
                            overflow: 'hidden',
                        }),
                    ]}
                >
                    {/* Decorative elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            backgroundColor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.05),
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            backgroundColor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.05),
                        }}
                    />

                    {/* Logo */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: 'common.white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (theme) => theme.customShadows.z8,
                            }}
                        >
                            <Box
                                component="img"
                                src={`${CONFIG.assetsDir}/logo/f2fsingle.svg`}
                                alt="Farm2Fork"
                                sx={{ width: 50, height: 50 }}
                            />
                        </Box>
                    </Box>

                    {/* Welcome text */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            position: 'relative',
                            zIndex: 1,
                            fontFamily: themeConfig.fontFamily.bricolage
                        }}
                    >
                        Üdvözlünk a megújult<br/>Farm2Fork webshopban!
                    </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ px: 4, py: 4 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 3,
                            color: 'text.secondary',
                            textAlign: 'center',
                            lineHeight: 1.8,
                        }}
                    >
                        Sokat dolgoztunk, hogy számotokra a legjobb élményt nyújtsuk és a vásárlás folyamatát gyorssá és zökkenőmentessé tegyük. De itt ott egy kis finomhangolás még szükséges lehet.
                    </Typography>

                    {/* Help section with icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                            p: 2.5,
                            borderRadius: 2,
                            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                            border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.16)}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Iconify
                                icon="solar:chat-round-dots-bold"
                                width={24}
                                sx={{ color: 'common.white' }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Ha bármilyen problémát, hibát találsz, vagy kérdésed van, bátran
                                használd a{' '}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: 700, color: 'primary.main' }}
                                >
                                    bal alsó sarokban található chat ikont
                                </Box>
                                .<br />Kollégáink szívesen segítenek!
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleClose}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                boxShadow: (theme) => theme.customShadows.z8,
                                '&:hover': {
                                    boxShadow: (theme) => theme.customShadows.z12,
                                },
                            }}
                        >
                            Kezdjük el!
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
