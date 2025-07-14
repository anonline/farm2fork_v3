'use client';

import { Box, Typography, Container } from '@mui/material';

export default function TarolasHero() {
    const heroImageUrl = 'https://images.unsplash.com/photo-1542189824-556a3a4834de?q=80&w=2070';

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: '300px', sm: '400px', md: '500px' },
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    color: 'white',
                    backgroundImage: `url(${heroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius:'8px'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)',//ezt ki kell venni amikor képekel van feltöltve
                        borderRadius:'8px'
                    }}
                />
                
                <Container maxWidth="lg">
                    <Typography
                        variant="h1"
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            pb: { xs: 2, md: 4 },
                            color: 'rgb(255, 255, 255)',
                            fontSize: { xs: '40px', md: '64px' },
                            fontWeight: 600,
                            letterSpacing: '-1px',
                            lineHeight: { xs: '48px', md: '70px' },
                            textAlign: 'start',
                            textTransform: 'uppercase',
                        }}
                    >
                        Tárolási Információk
                    </Typography>
                </Container>
            </Box>

            <Box maxWidth="md" sx={{ mt: 3 }}>
                <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                        textAlign: 'start',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '24px',
                    }}
                >
                    Termelőink sokat dolgoznak azért, hogy kiváló minőségű alapanyagok kerüljenek a tanyérodra. Tárolási tippjeinkkel segítünk, hogy minél tovább élvezhesd a finom ízeket és a termelésbe fektetett idő, erőforrások se kerüljenek pazarlásra.
                </Typography>
            </Box>
        </Box>
    );
}