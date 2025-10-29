import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuthContext } from 'src/auth/hooks';

import { Nav, NavUl } from '../components';
import { NavList } from './nav-mobile-list';

import type { NavMainProps } from '../types';
import { allLangs, useTranslate } from 'src/locales';
import { Iconify } from 'src/components/iconify';
import { Typography } from '@mui/material';
import { FlagIcon } from 'src/components/flag-icon';

import type { LanguageValue } from 'src/locales';

// ----------------------------------------------------------------------

export type NavMobileProps = NavMainProps & {
    open: boolean;
    onClose: () => void;
    slots?: {
        topArea?: React.ReactNode;
        bottomArea?: React.ReactNode;
    };
};

export function NavMobile({ data, open, onClose, slots, sx }: NavMobileProps) {
    const pathname = usePathname();
    const { t } = useTranslate('navbar');
    const { authenticated, user } = useAuthContext();
    const { onChangeLang, currentLang } = useTranslate();
    const [languageOpen, setLanguageOpen] = useState(false);

    const handleChangeLang = (newLang: LanguageValue) => {
        onChangeLang(newLang);
        setLanguageOpen(false);
    };

    useEffect(() => {
        if (open) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return (
        <Drawer
            open={open}
            anchor="right"
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: [
                        {
                            display: 'flex',
                            flexDirection: 'column',
                            width: 'var(--layout-nav-mobile-width)',
                        },
                        ...(Array.isArray(sx) ? sx : [sx]),
                    ],
                },
            }}
        >
            {slots?.topArea ?? (
                <Box
                    sx={{
                        pt: 3,
                        pb: 2,
                        pl: 2.5,
                        display: 'flex',
                    }}
                >
                    <Logo />
                </Box>
            )}

            <Scrollbar fillContent>
                <Nav
                    sx={{
                        pb: 3,
                        display: 'flex',
                        flex: '1 1 auto',
                        flexDirection: 'column',
                    }}
                >
                    <NavUl>
                        {data.map((list) => (
                            <NavList key={list.title} data={list} />
                        ))}
                    </NavUl>
                </Nav>
            </Scrollbar>

            {slots?.bottomArea ?? (
                <Box
                    sx={{
                        py: 3,
                        px: 2.5,
                        gap: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/*<SignInButton fullWidth />*/}

                    <Box sx={{display: 'none !important'}}>
                        <Box 
                            onClick={() => setLanguageOpen(!languageOpen)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                cursor: 'pointer',
                                p: 1,
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon={'solar:globe-outline'} width={20} />
                                <Typography>{t('language')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{textTransform:'uppercase'}}>{currentLang.value}</Typography>
                                <Iconify 
                                    icon={languageOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} 
                                    width={16} 
                                />
                            </Box>
                        </Box>

                        <Collapse in={languageOpen}>
                            <MenuList sx={{ py: 1 }}>
                                {allLangs.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        selected={option.value === currentLang.value}
                                        onClick={() => handleChangeLang(option.value)}
                                        sx={{ gap: 1 }}
                                    >
                                        <FlagIcon code={option.countryCode} />
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Collapse>
                    </Box>

                    {authenticated && user?.user_metadata?.is_admin && (
                        <Button
                            fullWidth
                            variant="contained"
                            rel="noopener"
                            target="_blank"
                            href={paths.dashboard.root}
                        >
                            Admin
                        </Button>
                    )}
                </Box>
            )}
        </Drawer>
    );
}
