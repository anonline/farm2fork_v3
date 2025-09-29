'use client';

import type { Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Chip, Link, Tooltip, useTheme, Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { fPercent } from 'src/utils/format-number';

import { themeConfig } from 'src/theme';
import { ensureValidAnnouncement } from 'src/actions/announcements';

import { Logo } from 'src/components/logo';
import { BackToTopButton } from 'src/components/animate';
import { SideCart, useSideCart, SideCartProvider } from 'src/components/sidecart';

import { useAuthContext } from 'src/auth/hooks';

import { Footer } from './footer';
import { NavMobile } from './nav/mobile';
import { NavDesktop } from './nav/desktop';
import { MainSection } from '../core/main-section';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { navData as mainNavData } from '../nav-config-main';
import { SignInButton } from '../components/sign-in-button';
import LoggedInHeaderAvatar from '../components/logged-in-header-avatar';
import HeaderSearchMobile from '../components/header-search-mobile/header-search-mobile';
import HeaderCartButtonMobile from '../components/header-cart-button-mobile/header-cart-button-mobile';

import type { FooterProps } from './footer';
import type { NavMainProps } from './nav/types';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

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
    return (
        <SideCartProvider>
            <MainLayoutContent
                sx={sx}
                cssVars={cssVars}
                children={children}
                slotProps={slotProps}
                layoutQuery={layoutQuery}
            />
        </SideCartProvider>
    );
}

function MainLayoutContent({
    sx,
    cssVars,
    children,
    slotProps,
    layoutQuery = 'md',
}: MainLayoutProps) {
    const theme = useTheme();
    const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
    const { isOpen: isSideCartOpen, closeSideCart } = useSideCart();
    const navData = slotProps?.nav?.data ?? mainNavData;
    const [announcement, setAnnouncement] = useState<string | null>(null);
    const authContext = useAuthContext();

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                // Use the new function that checks and creates announcements if needed
                const announcementData = await ensureValidAnnouncement();

                if (announcementData && announcementData.text) {
                    setAnnouncement(announcementData.text);
                }
            } catch (error) {
                // Silently handle supabase connection errors
                console.log('Could not fetch/create announcements:', error);
            }
        };
        fetchAnnouncement();
    }, []);

    const renderRoleChip = () => {
        const isAdmin = authContext.user?.user_metadata?.is_admin;
        const isCorp = authContext.user?.user_metadata?.is_corp;
        const isVip = authContext.user?.user_metadata?.is_vip;
        const discountPercent = authContext.user?.user_metadata?.discountPercent || 0;

        const percentLabel = discountPercent > 0 ? ` -${fPercent(discountPercent)}` : '';



        const showChip = isAdmin || isCorp || isVip || discountPercent > 0;
        const chipColor = isAdmin ? 'primary' : isCorp ? 'info' : isVip ? 'warning' : 'success';
        let chipLabel = '';

        if (isAdmin) {
            chipLabel = 'Admin';
        }
        else if (isCorp) {
            if (discountPercent > 0) {
                chipLabel = percentLabel;
            }
            else {
                chipLabel = 'Céges';
            }
        }
        else if (isVip) {
            if (discountPercent > 0) {
                chipLabel = percentLabel;
            }
            else {
                chipLabel = 'VIP';
            }

        }
        else if (discountPercent > 0) {
            chipLabel = percentLabel;
        }

        const toolTipLabel = isAdmin && "Adminisztráció" ||
            isCorp && "Céges kedvezményben részesülsz." ||
            isVip && "VIP kedvezményben részesülsz." ||
            discountPercent > 0 && `- ${fPercent(discountPercent)} kedvezményben részesülsz, amely már levonásra került az árakból.`;

        if (showChip) {
            if (isAdmin) {
                return (
                    <Link href={paths.dashboard.root} target="_blank" style={{ textDecoration: 'none' }}>
                        <Tooltip title={toolTipLabel}>
                            <Chip variant="soft" label={chipLabel} color={chipColor} />
                        </Tooltip>
                    </Link>);
            }
            return <Tooltip title={toolTipLabel}><Chip variant="soft" label={chipLabel} color={chipColor} /></Tooltip>;
        }
        return null;
    }

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
    };

    const renderHeader = () => {
        const headerSlots: HeaderSectionProps['slots'] = {
            topArea: (
                <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                    This is an info Alert.
                </Alert>
            ),
            leftArea: (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        // Mobile: Logo only on the left
                        [theme.breakpoints.down(layoutQuery)]: {
                            flex: 'none',
                        },
                    }}
                >
                    {/* Logo - always visible */}
                    <Logo sx={{ marginRight: { xs: 0, [layoutQuery]: '30px' }, marginTop: '-8px' }} />

                    {/* Desktop Navigation - hidden on mobile */}
                    <Container
                        sx={{
                            display: 'none',
                            [theme.breakpoints.up(layoutQuery)]: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                paddingLeft: { sm: 0, md: 0, lg: 0, xl: 0 },
                            },
                        }}
                    >
                        <NavDesktop
                            data={navData}
                            sx={{
                                mr: 2.5,
                                display: 'flex',
                            }}
                        />
                    </Container>
                </Box>
            ),
            rightArea: (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1.5 },
                        // Mobile: compact layout for icons
                        [theme.breakpoints.down(layoutQuery)]: {
                            gap: 1.5,
                        },
                    }}
                >
                    {/* Search - responsive component */}
                    <HeaderSearchMobile />

                    {/* Cart - responsive component */}
                    <HeaderCartButtonMobile />

                    {/* Authentication */}
                    {!authContext.loading && authContext.authenticated ? (
                        <>
                            <LoggedInHeaderAvatar />
                            {/* Hide admin/corp/vip chips on mobile */}
                            <Box
                                sx={{
                                    display: 'none',
                                    [theme.breakpoints.up(layoutQuery)]: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    },
                                }}
                            >
                                {renderRoleChip()}
                            </Box>
                        </>
                    ) : (
                        <SignInButton
                            sx={{
                                backgroundColor: themeConfig.palette.common.black,
                                borderRadius: '8px',
                                fontFamily: themeConfig.fontFamily.primary,
                                padding: { xs: '6px 12px', sm: '8px 20px' },
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                color: themeConfig.palette.common.white,
                                fontSize: { xs: '12px', sm: '14px' },
                                lineHeight: '30px',
                                letterSpacing: '0.01em',
                                '&:hover': {
                                    backgroundColor: themeConfig.palette.primary.main,
                                    color: themeConfig.palette.common.white,
                                },
                            }}
                        />
                    )}

                    {/* Mobile Menu Button - only visible on mobile */}
                    <MenuButton
                        onClick={onOpen}
                        sx={(muiTheme) => ({
                            display: 'none',
                            [muiTheme.breakpoints.down(layoutQuery)]: {
                                display: 'flex',
                                ml: 0.5,
                            },
                        })}
                    />

                    {/* Mobile Navigation Drawer */}
                    <NavMobile data={navData} open={open} onClose={onClose} />
                </Box>
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

    const renderFooter = () => (
        <Footer sx={slotProps?.footer?.sx} layoutQuery={layoutQuery} />
    );

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
            <BackToTopButton scrollThreshold="20%" />

            {renderMain()}
            <SideCart open={isSideCartOpen} onClose={closeSideCart} />
        </LayoutSection>
    );
}
