'use client';

import { Box, Container, Typography } from '@mui/material';

import { themeConfig } from 'src/theme';
import { useTranslate } from 'src/locales/use-locales';

export default function RolunkHero() {
    const { t } = useTranslate('rolunk');
    
    return (
        <Container sx={{ paddingY: { xs: 2, md: 4 } }}>
            <Box
                sx={{
                    position: 'relative',
                    maxHeight: { xs: '350px', sm: '490px' },
                    overflow: 'hidden',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '490px',
                        maxHeight: '490px',
                        overflow: 'hidden',
                        zIndex: 0,
                        borderRadius: '8px',
                        padding: '30px',
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    <Box
                        component="iframe"
                        src="https://www.youtube.com/embed/w51WHx0knpA?autoplay=1&mute=1&loop=1&playlist=w51WHx0knpA&controls=0&showinfo=0&modestbranding=1&rel=0"
                        allow="autoplay"
                        allowFullScreen
                        sx={{
                            position: 'absolute',
                            top: '-25%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            zIndex: -1,
                            border: 0,
                            pointerEvents: 'none',
                        }}
                    />
                </Box>
                <Box sx={{}}>
                    <Box
                        component="img"
                        src="https://farm2fork.hu/wp-content/uploads/2024/11/Video.jpg"
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            height: '100%',
                            objectFit: 'cover',
                            border: 0,
                            pointerEvents: 'none',
                            borderRadius: '8px',
                            width: '100%',
                        }}
                    />

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '24px',
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                                color: 'white',
                                fontWeight: '600',
                                textAlign: 'start',
                                lineHeight: 1.1,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.01em',
                                position: 'relative',
                                zIndex: 1,
                                fontFamily: themeConfig.fontFamily.bricolage
                            }}
                        >
                            Farm2Fork
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    '@media (min-width:1024px)': {
                        width: '65%',
                    },
                }}
            >
                <Typography sx={{ fontSize: '16px' }}>
                    {t('top_description')}
                </Typography>
            </Box>
        </Container>
    );
}
