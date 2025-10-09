'use client';

import { useRouter } from 'next/navigation';
import pafrany from 'public/assets/images/home/pafrany-1024x1024.webp';
import hagymaszedes from 'public/assets/images/home/hagymaszedes-1025x1536.webp';
import fooldal_rolunk from 'public/assets/images/home/fooldal_rolunk-1024x1024.webp';

import { Box, Grid, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { themeConfig } from 'src/theme';

export default function HomeHighlight() {
    const router = useRouter();

    const h2Style = {
        fontSize: { xs: '28px', md: '40px' },
        lineHeight: { xs: '40px', md: '48px' },
        textTransform: 'uppercase',
        fontWeight: 600,
        mb: { xs: 4, md: 5 },
        fontFamily: themeConfig.fontFamily.bricolage,
    };

    const buttonStyle = {
        mt: 2,
        alignSelf: 'flex-start',
        border: '2px solid black',
        color: 'black',
        '&:hover': {
            backgroundColor: 'rgb(70, 110, 80)',
            color: 'white',
            borderColor: 'rgb(70, 110, 80)',
        },
    };

    const introductiondata = [
        {
            img: fooldal_rolunk,
            title: 'Rólunk',
            text: 'A Farm2Fork mindennapi működtetése során nagy hangsúlyt fektetünk a környezetbarát megoldásokra és a bio alapanyagok beszerzésére. Küldetésünk, hogy összekössük a felelős gazdálkodókat és a tudatos vásárlókat, ezzel is biztosítva a minőségi alapanyagokat vásárlóink számára.',
            buttonText: 'Tovább',
            path: paths.rolunk,
        },
        {
            img: hagymaszedes,
            title: 'Termelők',
            text: 'A Farm2Forknál alapelveink: a jó minőség, a kapcsolatok és a fair trade. Termelőinket személyesen ismerjük, és hosszú ideje jó kapcsolatot ápolunk velük. Kiemelten fontos számunkra a méltányos kereskedelem elve, így rendeléseddel te is hozzájárulhatsz a magyar termelők támogatásához.',
            buttonText: 'Összes termelő',
            path: '/termelok',
        },
        {
            img: pafrany,
            title: 'Szezonalitás',
            text: 'A Farm2Forknál alapvetés, hogy csak helyi és szezonális alapanyagokat kínálunk. Valljuk, hogy a frissen, szezonjában leszedett alapanyagok finomabbak és fenntarthatósági szempontból is előnyösebbek.',
            buttonText: 'Tovább',
            path: paths.szezonalitas,
        },
    ];

    return (
        <Box sx={{ my: 5 }}>
            <Typography variant="h2" sx={h2Style}>
                Ismerj meg minket
            </Typography>

            <Grid container spacing={{ xs: 3, md: 4 }}>
                {introductiondata.map((card) => (
                    <Grid size={{ xs: 12, md: 4 }} key={card.title}>
                        <Stack
                            spacing={2}
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <Box
                                component="img"
                                src={typeof card.img === 'string' ? card.img : card.img.src}
                                alt={card.title}
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    maxWidth: '414px',
                                    maxHeight: '392px',
                                }}
                            />
                            <Typography
                                variant="h3"
                                sx={{
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    fontSize: '20px',
                                    pt: 1,
                                    fontFamily: themeConfig.fontFamily.bricolage
                                }}
                            >
                                {card.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                                {card.text}
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={buttonStyle}
                                onClick={() => router.push(card.path)}
                            >
                                {card.buttonText}
                            </Button>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
