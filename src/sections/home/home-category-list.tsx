import type { BoxProps } from '@mui/material/Box';

import { useState } from 'react';
import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Typography, ListItemText } from '@mui/material';

import { themeConfig } from 'src/theme';
import { useCategories } from 'src/contexts/category-context';

import { varFade, MotionViewport } from 'src/components/animate';

import { CircleSvg } from './components/svg-elements';
import { SectionTitle } from './components/section-title';

export function HomeCategoryList({ sx, ...other }: BoxProps) {

    const categories = useCategories();

    const [hovered, setHovered] = useState(categories.categories.length > 0 ? categories.categories[0].coverUrl : 'https://farm2fork.hu/wp-content/uploads/2025/05/DSC4379_FIN-1-scaled.jpg');

    const renderDescription = () => (
        <>
            <SectionTitle
                caption=""
                title="NÉZZ SZÉT A TERMÉKEINK KÖZT"
                txtGradient=""
                description=""
                sx={{ textAlign: { xs: 'center', md: 'left' }, fontSize: '40px', fontFamily: themeConfig.fontFamily.primary, fontWeight: 600, lineHeight: '48px', mb: 3 }}
            />

            <Stack
                direction="column"
                spacing={1}>
                {categories.loading && <ListItemText primary="Loading categories..." />}
                {categories.error && <ListItemText primary={`Error: ${categories.error}`} />}
                {categories.categories.map((category) => (
                    <Typography
                        key={category.id}
                        onMouseEnter={() => setHovered(category.coverUrl)}
                        sx={{
                            fontSize: '32px',
                            cursor: 'pointer',
                            fontWeight:400,
                            '&:hover': {
                                fontWeight: '700',
                            },
                        }}
                    >{category.name}</Typography>
                ))
                }
            </Stack>
        </>
    );

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

                    <Grid
                        container
                        spacing={{ xs: 5, md: 8 }}
                        sx={{ position: 'relative', zIndex: 9 }}
                    >
                        <Grid size={{ xs: 12, md: 6, lg: 5 }}>{renderDescription()}</Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 7 }}>{renderImage()}</Grid>
                    </Grid>

                    <CircleSvg
                        variants={varFade('in')}
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    />
            </MotionViewport>
        </Box>
    );
}
