'use client';

import { Box, Grid, Button, Typography } from "@mui/material";

import { themeConfig } from "src/theme";
import { useProducers } from "src/contexts/producers-context";

import ProducerCard from "../producer-card/producer-card";
import ProducersPageFilter from "../producers-page-filter/producers-page-filter";



export default function ProducersPage() {
    const { producers, loading, error } = useProducers();

    return (
        <>

            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '490px',
                    maxHeight: '490px',
                    overflow: 'hidden',
                    zIndex: 0,
                    borderRadius:'8px',
                    padding:'30px',
                    marginBottom:'20px',

                }}
            >
                {/* YouTube video háttérként */}
                <Box
                    component="iframe"
                    src="https://www.youtube.com/embed/JT3RKC0fecc?autoplay=1&mute=1&loop=1&playlist=JT3RKC0fecc&controls=0&showinfo=0&modestbranding=1&rel=0"
                    allow="autoplay"
                    allowFullScreen
                    sx={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        zIndex: -1,
                        border: 0,
                        pointerEvents: 'none',
                    }}
                />

                {/* Tartalom */}
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        color: 'white',
                        bottom:0,
                        left:0,
                        p: 4,
                    }}
                >
                    <Typography variant="h1" sx={{fontSize:'64px', fontWeight:'600', letterSpacing:'-1px', textTransform:'uppercase'}}>Termelők</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '50px', gap: '30px', width: '100%', justifyContent: 'space-between' }}>
                <Typography sx={{ width: '60%', fontFamily: themeConfig.fontFamily.primary, fontSize: '16px', fontWeight: 500, lineHeight: '28px' }}>
                    A Farm2Forknál alapelveink a kiváló minőség és a méltányos kereskedelem. Termelőinket személyesen ismerjük, és hosszú ideje jó kapcsolatot ápolunk velük. Kiemelten fontos számunkra a méltányos kereskedelem elve, így rendeléseddel te is hozzájárulhatsz a magyar termelők támogatásához. A Farm2Fork azért jött létre, hogy összekapcsolja a tudatos vásárlókat az elhivatott helyi termelőkkel.
                </Typography>
                <Box sx={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '24px' }}>
                    <Typography variant="h3" sx={{ textTransform: 'uppercase', fontFamily: themeConfig.fontFamily.primary, fontSize: '28px', fontWeight: 600, lineHeight: '36px' }}>
                        Termelő vagy?
                    </Typography>
                    <Typography sx={{
                        fontFamily: themeConfig.fontFamily.primary,
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '24px',
                        letterSpacing: '0.01em',
                        verticalAlign: 'middle',
                        color: themeConfig.palette.grey[500]
                    }}>
                        Amennyiben szívesen dolhoznál velünk, várjuk jelentkezésedet!
                    </Typography>
                    <Button style={{ width: '125px', padding: '10px 24px' }} variant="outlined">
                        Írj nekünk
                    </Button>
                </Box>
            </Box>
            <ProducersPageFilter />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <Grid container spacing={1} justifyContent="start" style={{ marginTop: '20px' }}>
                {producers.map(producer => (
                    <Grid size={{ xs: 12, sm: 4, md: 2.4, lg: 2.4 }} key={producer.id}>
                        <ProducerCard producer={producer} />
                    </Grid>
                ))}
            </Grid>
        </>

    );

}