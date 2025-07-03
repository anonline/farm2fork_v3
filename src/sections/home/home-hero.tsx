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
    heroImg:string;
    heroHeight:string;
    heroTitle: string;
    heroPrimaryBtnText: string;
    heroSecondaryBtnText: string;
    heroImgOverlay:string;
}

export function HomeHero({ heroImg, heroHeight, heroTitle, heroPrimaryBtnText, heroSecondaryBtnText, heroImgOverlay, sx, ...other }: HomeHeroProps & BoxProps) {
    return (
        <Box sx={{
            width: '100%',
            backgroundImage: "url("+heroImg+")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: 'center',
            height:heroHeight,
            display:'flex',
            position:'relative'
        }}>
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
            <Container maxWidth="lg" sx={{
                alignItems: 'flex-end',
                display: 'flex',
                
                
                py:'80px',
                zIndex:2
                }}>
                <Box sx={{
                    width:'60%',
                    textTransform: 'uppercase',
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: 'end',
                    m:0,
                    gap:5
                }}>
                    <Typography variant='h1' sx={(theme)=>({
                        color:theme.palette.common.white,
                        fontSize: '64px',
                        fontWeight:600,
                        lineHeight: '70px',
                        letterSpacing: '-1px',
                    })}>
                        {heroTitle}
                    </Typography>
                    <Stack
                        direction= 'row'
                        spacing={3}
                        sx={{
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Button
                            variant='contained'
                            color='primary'
                            sx={(theme) => ({
                                fontSize: '18px',
                                padding: '16px 24px',
                                borderRadius: "8px",
                                lineHeight: '22px',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: theme.vars.palette.primary.main
                            })}
                            component={RouterLink}
                            href={paths.product.root}
                        >
                            {heroPrimaryBtnText}
                        </Button>
                        <Button variant='outlined' color='info' sx={(theme) => ({
                            fontSize: '18px',
                            padding: '16px 24px',
                            borderRadius:"8px",
                            lineHeight:'22px',
                            color: theme.palette.common.white,
                            borderColor: theme.palette.common.white,
                        })}>
                            {heroSecondaryBtnText}
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
