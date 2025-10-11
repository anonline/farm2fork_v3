import { Box, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';

export default function RolunkTeam() {
    return (
        <Container
            sx={{
                marginTop: '40px',
                marginBottom: '40px',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '24px',
                textAlign: 'start',
                alignSelf: 'auto',
                minWidth: '100%',
            }}
        >
            <Container>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'auto',
                        width: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: '100%', lg: '50%' },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: { xs: 3, lg: 0 },
                        }}
                    >
                        <img
                            src={`${CONFIG.assetsDir}/Rectangle-7.jpg`}
                            alt="Horváth Boldizsár"
                            style={{
                                borderRadius: '8px',
                                width: '100%',
                                minWidth: 250,
                                minHeight: 200,
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            width: { xs: '100%', lg: '50%' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            minWidth: { xs: 'auto', lg: '350px' },
                            height: '100%',
                            padding: '20px',
                            boxSizing: 'border-box',
                            rowGap: '20px',
                            textSizeAdjust: '100%',
                            fontSize: '16px',
                            fontWeight: '400',
                            lineHeight: '24px',
                            textAlign: 'start',
                        }}
                    >
                        <Typography
                            sx={{
                                textTransform: 'uppercase',
                                fontSize: { xs: '20px', md: '28px' },
                                fontWeight: 'bold',
                            }}
                            component="h2"
                            gutterBottom
                        >
                            Horváth Boldizsár
                        </Typography>

                        <Typography gutterBottom>
                            A Farm2Fork vállalkozás alapítója és tulajdonosa. Minden nap azon
                            dolgozom, hogy a magyar termelőket összekössem a top éttermekkel és a
                            kiváló minőségű, helyi alapanyagokra nyitott lakossági megrendelőkkel.
                        </Typography>
                        <Typography gutterBottom>
                            Kollégáimmal büszkék vagyunk arra, hogy több étteremnek is beszállítója
                            lehetünk. Ezen éttermek mindegyikének fontos, hogy a magas minőség, a
                            szezonalitás és a finom ételek mellett beszerzéseikkel a hazai
                            termelőket támogassák – ez pedig a Farm2Fork egyik legfőbb célkitűzése
                            is. Partnereinkkel méltányos kereskedelemi formát alakítottunk ki, így a
                            rendeléseddel te is közvetlenül támogathatod a magyar bio- és
                            konvencionális termelőket.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Container>
    );
}
