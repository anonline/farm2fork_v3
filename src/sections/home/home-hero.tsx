import type { MotionProps } from 'framer-motion';
import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const smKey: Breakpoint = 'sm';
const mdKey: Breakpoint = 'md';
const lgKey: Breakpoint = 'lg';

const motionProps: MotionProps = {
    variants: varFade('inUp', { distance: 24 }),
};

type HomeHeroProps = {
    heroImg: string;
    heroHeight: string;
    heroTitle: string;
    heroPrimaryBtnText: string;
    heroSecondaryBtnText: string;
    heroImgOverlay: string;
};

export function HomeHero({
    heroImg,
    heroHeight,
    heroTitle,
    heroPrimaryBtnText,
    heroSecondaryBtnText,
    heroImgOverlay,
    sx,
    ...other
}: HomeHeroProps & BoxProps) {
    return (
        <Box
            sx={{
                width: '100%',
                backgroundImage: 'url(' + heroImg + ')',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: { xs: 'center', md: 'center' },
                height: heroHeight,
                display: 'flex',
                position: 'relative',
                minHeight: { xs: '500px', sm: '600px' },
                ...sx,
            }}
            {...other}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: heroImgOverlay, // fekete overlay 50% áttetszőséggel
                    zIndex: 1,
                }}
            />
            <Container
                maxWidth="lg"
                sx={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    py: { xs: '40px', sm: '60px', md: '80px' },
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', sm: '90%', md: '80%', lg: '60%' },
                        textTransform: 'uppercase',
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'end',
                        m: 0,
                        gap: { xs: 3, sm: 4, md: 5 },
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={(theme) => ({
                            color: theme.palette.common.white,
                            fontSize: { 
                                xs: '32px', 
                                sm: '40px', 
                                md: '52px', 
                                lg: '64px' 
                            },
                            fontWeight: 600,
                            lineHeight: { 
                                xs: '36px', 
                                sm: '44px', 
                                md: '56px', 
                                lg: '70px' 
                            },
                            letterSpacing: { xs: '-0.5px', md: '-1px' },
                        })}
                    >
                        {heroTitle}
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 2, sm: 3 }}
                        sx={{
                            alignItems: { xs: 'stretch', sm: 'flex-start' },
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            sx={(theme) => ({
                                fontSize: { xs: '16px', sm: '18px' },
                                padding: { xs: '14px 20px', sm: '16px 24px' },
                                borderRadius: '8px',
                                lineHeight: { xs: '20px', sm: '22px' },
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: theme.vars.palette.primary.main,
                                minWidth: { xs: 'auto', sm: 'auto' },
                            })}
                            component={RouterLink}
                            href={paths.product.root}
                        >
                            {heroPrimaryBtnText}
                        </Button>
                        <Button
                            variant="outlined"
                            color="info"
                            sx={(theme) => ({
                                fontSize: { xs: '16px', sm: '18px' },
                                padding: { xs: '14px 20px', sm: '16px 24px' },
                                borderRadius: '8px',
                                lineHeight: { xs: '20px', sm: '22px' },
                                color: theme.palette.common.white,
                                borderColor: theme.palette.common.white,
                                minWidth: { xs: 'auto', sm: 'auto' },
                            })}
                        >
                            {heroSecondaryBtnText}
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
