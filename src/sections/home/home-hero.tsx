import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';
import type { MotionProps, MotionValue, SpringOptions } from 'framer-motion';

import { useRef, useState } from 'react';
import { m, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar, { avatarClasses } from '@mui/material/Avatar';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _mock } from 'src/_mock';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionContainer } from 'src/components/animate';

import { HeroBackground } from './components/hero-background';

// ----------------------------------------------------------------------

const smKey: Breakpoint = 'sm';
const mdKey: Breakpoint = 'md';
const lgKey: Breakpoint = 'lg';

const motionProps: MotionProps = {
    variants: varFade('inUp', { distance: 24 }),
};

type HomeHeroProps = {
    heroImg:string;
    heroHeight:string;
}

export function HomeHero({ heroImg,heroHeight, sx, ...other }: HomeHeroProps & BoxProps) {

    const mdUp = useMediaQuery((theme) => theme.breakpoints.up(mdKey));

    const renderHeading = () => (
        <m.div {...motionProps}>
            <Box
                component="h1"
                sx={[
                    (theme) => ({
                        my: 0,
                        mx: 'auto',
                        maxWidth: 680,
                        display: 'flex',
                        flexWrap: 'wrap',
                        typography: 'h2',
                        justifyContent: 'center',
                        fontFamily: theme.typography.fontSecondaryFamily,
                        [theme.breakpoints.up(lgKey)]: {
                            fontSize: theme.typography.pxToRem(72),
                            lineHeight: '90px',
                        },
                    }),
                ]}
            >
                <Box component="span" sx={{ width: 1, opacity: 0.24 }}>
                    Boost your building
                </Box>
                process with
                <Box
                    component={m.span}
                    animate={{ backgroundPosition: '200% center' }}
                    transition={{
                        duration: 20,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                    sx={[
                        (theme) => ({
                            ...theme.mixins.textGradient(
                                `300deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.warning.main} 25%, ${theme.vars.palette.primary.main} 50%, ${theme.vars.palette.warning.main} 75%, ${theme.vars.palette.primary.main} 100%`
                            ),
                            backgroundSize: '400%',
                            ml: { xs: 0.75, md: 1, xl: 1.5 },
                        }),
                    ]}
                >
                    Minimal
                </Box>
            </Box>
        </m.div>
    );

    const renderText = () => (
        <m.div {...motionProps}>
            <Typography
                variant="body2"
                sx={[
                    (theme) => ({
                        mx: 'auto',
                        [theme.breakpoints.up(smKey)]: { whiteSpace: 'pre' },
                        [theme.breakpoints.up(lgKey)]: { fontSize: 20, lineHeight: '36px' },
                    }),
                ]}
            >
                {`The starting point for your next project is based on MUI. \nEasy customization helps you build apps faster and better.`}
            </Typography>
        </m.div>
    );

    const renderRatings = () => (
        <m.div {...motionProps}>
            <Box
                sx={{
                    gap: 1.5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    typography: 'subtitle2',
                    justifyContent: 'center',
                }}
            >
                <AvatarGroup sx={{ [`& .${avatarClasses.root}`]: { width: 32, height: 32 } }}>
                    {Array.from({ length: 3 }, (_, index) => (
                        <Avatar
                            key={_mock.fullName(index + 1)}
                            alt={_mock.fullName(index + 1)}
                            src={_mock.image.avatar(index + 1)}
                        />
                    ))}
                </AvatarGroup>
                160+ Happy customers
            </Box>
        </m.div>
    );

    const renderButtons = () => (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 1.5, sm: 2 },
            }}
        >
            <m.div {...motionProps}>
                <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                    <Button
                        component={RouterLink}
                        href={paths.dashboard.root}
                        color="inherit"
                        size="large"
                        variant="contained"
                        startIcon={<Iconify width={24} icon="custom:flash-outline" />}
                    >
                        <span>
                            Live preview
                            <Box
                                component="small"
                                sx={[
                                    (theme) => ({
                                        mt: '-3px',
                                        opacity: 0.64,
                                        display: 'flex',
                                        fontSize: theme.typography.pxToRem(10),
                                        fontWeight: theme.typography.fontWeightMedium,
                                    }),
                                ]}
                            >
                                v{CONFIG.appVersion}
                            </Box>
                        </span>
                    </Button>

                    <Link
                        color="inherit"
                        variant="body2"
                        target="_blank"
                        rel="noopener"
                        href={paths.freeUI}
                        underline="always"
                        sx={{ gap: 0.75, alignItems: 'center', display: 'inline-flex' }}
                    >
                        <Iconify width={16} icon="eva:external-link-fill" />
                        Get free version
                    </Link>
                </Stack>
            </m.div>

            <m.div {...motionProps}>
                <Button
                    color="inherit"
                    size="large"
                    variant="outlined"
                    target="_blank"
                    rel="noopener"
                    href={paths.figmaUrl}
                    startIcon={<Iconify width={24} icon="solar:figma-outline" />}
                    sx={{ borderColor: 'text.primary' }}
                >
                    Figma preview
                </Button>
            </m.div>
        </Box>
    );

    return (
        <Box sx={{
            width: '100%',
            backgroundImage: "url("+heroImg+")",
            backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
            height:heroHeight,
            display:'flex',
        }}>
            <Container sx={{
                border:'1px solid blue',
                alignItems: 'flex-end',
                display: 'flex',
                padding:'none',
                }}>
                <Box sx={{
                    width:'50%',
                    display: 'flex',
                    border: '1px solid red',
                    alignSelf: 'end',
                    m:0
                }}>
                    <Typography variant='h1' sx={(theme)=>({
                        color:theme.palette.common.white
                    })}>
                        Szezonális termékek hazai termelőktől
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
