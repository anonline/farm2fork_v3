'use client';

import type { Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Avatar, Button, Chip, Container, Link, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';
import { supabase } from 'src/lib/supabase';

import { Logo } from 'src/components/logo';
import F2FIcons from 'src/components/f2ficons/f2ficons';

import { Footer } from './footer';
import { NavMobile } from './nav/mobile';
import { NavDesktop } from './nav/desktop';
import { MainSection } from '../core/main-section';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { navData as mainNavData } from '../nav-config-main';
import { SignInButton } from '../components/sign-in-button';

import type { FooterProps } from './footer';
import type { NavMainProps } from './nav/types';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';
import { AuthProvider } from 'src/auth/context/amplify';
import { useAuthContext } from 'src/auth/hooks';
import LoggedInHeaderAvatar from '../components/logged-in-header-avatar';
import { paths } from 'src/routes/paths';
import HeaderSearch from '../components/header-search/header-search';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type MainLayoutProps = LayoutBaseProps & {
    layoutQuery?: Breakpoint;
    slotProps?: {
        header?: HeaderSectionProps;
        nav?: {
            data?: NavMainProps['data'];
        };
        main?: MainSectionProps;
        footer?: FooterProps;
    };
};

export function MainLayout({
    sx,
    cssVars,
    children,
    slotProps,
    layoutQuery = 'md',
}: MainLayoutProps) {

    const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
    const navData = slotProps?.nav?.data ?? mainNavData;
    const [announcement, setAnnouncement] = useState<string | null>(null);
    const authContext = useAuthContext();

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('Announcement')
                .select('text, validFrom, validUntil')
                .order('validFrom', { ascending: false })
                .limit(1)
                .or(`validFrom.is.null,validFrom.lte.${now}`)
                .or(`validUntil.is.null,validUntil.gte.${now}`);

            if (!error && data && data.length > 0) {
                setAnnouncement(data[0].text);
            }
        };
        fetchAnnouncement();
    }, []);

    const renderAnnouncement = () => {
        if (!announcement) return null;

        return (
            <Box
                sx={{
                    width: '100%',
                    bgcolor: '#B4D7FF',
                    color: '#1A5290',
                    py: 1,
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: { xs: 14, sm: 16 },
                    letterSpacing: 0.2,
                }}
            >
                {announcement}
            </Box>
        );
    }

    const renderHeader = () => {
        const headerSlots: HeaderSectionProps['slots'] = {
            topArea: (
                <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                    This is an info Alert.
                </Alert>
            ),
            leftArea: (
                <>
                    {/** @slot Nav mobile */}
                    <MenuButton
                        onClick={onOpen}
                        sx={(theme) => ({
                            mr: 1,
                            ml: -1,
                            [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                        })}
                    />
                    <NavMobile data={navData} open={open} onClose={onClose} />

                    <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                        <Logo sx={{ marginRight: "50px", marginTop: '-8px' }} />
                        <NavDesktop
                            data={navData}
                            sx={(theme) => ({
                                display: 'none',
                                [theme.breakpoints.up(layoutQuery)]: { mr: 2.5, display: 'flex' },
                            })}
                        />
                    </Container>
                </>
            ),
            rightArea: (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                        <HeaderSearch />

                        <Button
                            startIcon={
                                <F2FIcons
                                    name="Bag"
                                    width={24}
                                    height={24}
                                    style={{ color: 'inherit' }}
                                />
                            }
                            variant="text"

                            sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                            Kosár
                        </Button>

                        {
                            !authContext.loading && authContext.authenticated ? (
                                <>
                                    <LoggedInHeaderAvatar name={authContext.displayName} />
                                    {authContext.user?.user_metadata?.is_admin && (
                                        <Link href={paths.dashboard.root}>
                                            <Chip
                                                variant="soft"
                                                label="Admin"
                                                color="primary"
                                            />
                                        </Link>
                                    )}
                                    {authContext.user?.user_metadata?.is_corp && (
                                        <Link href={paths.dashboard.root}>
                                            <Chip
                                                variant="soft"
                                                label="Céges"
                                                color="info"
                                            />
                                        </Link>
                                    )}
                                    {authContext.user?.user_metadata?.is_vip && (
                                        <Link href={paths.dashboard.root}>
                                            <Chip
                                                variant="soft"
                                                label="VIP"
                                                color="warning"
                                            />
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <SignInButton sx={
                                    {
                                        backgroundColor: themeConfig.palette.common.black,
                                        borderRadius: '8px',
                                        fontFamily: themeConfig.fontFamily.primary,
                                        padding: '8px 20px',

                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        color: themeConfig.palette.common.white,
                                        fontSize: '14px',
                                        lineHeight: '30px',
                                        letterSpacing: '0.01em',
                                        '&:hover': {
                                            backgroundColor: themeConfig.palette.primary.main,
                                            color: themeConfig.palette.common.white,
                                        },
                                    }
                                } />
                            )}
                    </Box>
                </>
            ),
        };

        return (
            <HeaderSection
                layoutQuery={layoutQuery}
                {...slotProps?.header}
                slots={{ ...headerSlots, ...slotProps?.header?.slots }}
                slotProps={slotProps?.header?.slotProps}
                sx={slotProps?.header?.sx}
            />
        );
    };

    const renderFooter = () =>
        /*isHomePage ? (
            <HomeFooter sx={slotProps?.footer?.sx} />
        ) : (*/
        <Footer sx={slotProps?.footer?.sx} layoutQuery={layoutQuery} />
    //);

    const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

    return (
        <LayoutSection
            announcementSection={renderAnnouncement()}
            /** **************************************
             * @Header
             *************************************** */
            headerSection={renderHeader()}
            /** **************************************
             * @Footer
             *************************************** */
            footerSection={renderFooter()}
            /** **************************************
             * @Styles
             *************************************** */
            cssVars={cssVars}
            sx={sx}
        >
            {renderMain()}
        </LayoutSection>
    );
}
