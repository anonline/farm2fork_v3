import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { Fragment, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Typography, ListItemText, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { themeConfig } from 'src/theme';
import { useCategories } from 'src/contexts/category-context';

import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';

export function HomeCategoryList({ sx, ...other }: BoxProps) {
    const categories = useCategories();

    const [hoveredId, setHoveredId] = useState(-1);

    const [hovered, setHovered] = useState(
        categories.categories.length > 0
            ? categories.categories[0].coverUrl
            : 'https://farm2fork.hu/wp-content/uploads/2025/05/DSC4379_FIN-1-scaled.jpg'
    );

    const renderDescription = () => (
        <>
            <SectionTitle
                caption=""
                title="NÉZZ SZÉT A TERMÉKEINK KÖZT"
                txtGradient=""
                description=""
                slotProps={{
                    title: {
                        sx: {
                            fontFamily: themeConfig.fontFamily.bricolage,
                            fontWeight: 600,
                            fontSize: '40px !important'
                        }
                    }
                }}
                sx={{
                    textAlign: { xs: 'center', md: 'left' },
                    fontSize: '40px',
                    fontFamily: themeConfig.fontFamily.bricolage,
                    fontWeight: 600,
                    lineHeight: '48px',
                    mb: {xs: 3, md: '100px'},
                }}
            />

            <Stack direction="column" spacing={1}>
                {categories.loading && <ListItemText primary={<CircularProgress size={20} />} />}
                {categories.error && <ListItemText primary={`Error: ${categories.error}`} />}
                {categories.categories.filter((category) => category.showHome).sort((a, b) => (a?.order ?? 0) > (b?.order ?? 0) ? 1 : -1).map((category) => {
                    const isHovered = hoveredId === category.id;

                    return (
                        <Link
                            key={category.id}
                            component={RouterLink}
                            href={paths.categories.list(category.slug)}
                            color="inherit"
                            underline="none"
                            onMouseEnter={() => {
                                setHovered(category.coverUrl || 'https://farm2fork.hu/wp-content/uploads/2025/05/DSC4379_FIN-1-scaled.jpg');
                                setHoveredId(category?.id || -1);
                            }}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                transition: 'all 0.2s ease-in-out',
                                
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: {xs: '28px', md: '32px'},
                                    cursor: 'pointer',
                                    fontWeight: isHovered ? '600' : '400',
                                    color: isHovered ? themeConfig.palette.common.black : '#a1a1a1',
                                    position: 'relative',
                                    '&:hover': {
                                        fontWeight: '600',
                                        color: themeConfig.palette.common.black,
                                    },
                                }}
                            >
                                {category.name}

                            </Typography>
                            <Box
                                sx={{
                                    verticalAlign: 'middle',
                                    display: 'inline-block',
                                    ml: 2,
                                    mt:1,
                                    opacity: isHovered ? 1 : 0,
                                    transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                                    transition: 'all 0.3s ease-in-out'
                                }}
                            >
                                <ArrowIcon />
                            </Box>
                        </Link>
                    );
                })}
            </Stack>
        </>
    );

    const ArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M0.334637 11.3333C0.334637 11.8856 0.782352 12.3333 1.33464 12.3333L16.5613 12.3333L9.81758 19.077C9.42608 19.4685 9.4272 20.1036 9.82008 20.4938L10.2942 20.9645C10.6851 21.3527 11.3164 21.3516 11.7059 20.962L21.668 11L11.7084 1.04043C11.3179 0.649907 10.6847 0.649906 10.2942 1.04043L9.82778 1.50685C9.4375 1.89713 9.43722 2.5298 9.82715 2.92043L16.5613 9.66666L1.33464 9.66666C0.782352 9.66666 0.334637 10.1144 0.334637 10.6667L0.334637 11.3333Z" fill="#262626" /></svg>
    const renderImage = () => (
        <Stack
            component={m.div}
            variants={varFade('inDown', { distance: 24 })}
            sx={[
                (theme) => ({
                    alignItems: 'flex-end',
                    filter: `drop-shadow(0 24px 48px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)})`,
                    ...theme.applyStyles('dark', {
                        filter: `drop-shadow(0 24px 48px ${varAlpha(theme.vars.palette.common.blackChannel, 0.16)})`,
                    }),
                }),
            ]}
        >
            <Box
                component="img"
                alt="Zone landing page"
                src={hovered}
                sx={[
                    (theme) => ({
                        height: 750,
                        objectFit: 'cover',
                        aspectRatio: '5/6',
                        borderRadius: '16px 16px 0 16px',
                        border: `solid 2px ${theme.vars.palette.common.white}`,
                    }),
                ]}
            />
        </Stack>
    );

    return (
        <Box
            component="section"
            sx={[
                {
                    pt: 10,
                    position: 'relative',
                    pb: { xs: 10, md: 20 },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <MotionViewport>
                <Grid container spacing={{ xs: 5, md: 8 }} sx={{ position: 'relative', zIndex: 9 }}>
                    <Grid size={{ xs: 12, md: 6, lg: 5 }}>{renderDescription()}</Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 7 }} sx={{display: {xs: 'none', md: 'block'}}}>{renderImage()}</Grid>
                </Grid>
            </MotionViewport>
        </Box>
    );
}
