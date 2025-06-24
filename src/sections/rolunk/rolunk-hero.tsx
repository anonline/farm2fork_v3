import { Box, Container, Typography } from "@mui/material";


export default function RolunkHero() {


    return (
        <Container >
            <Container
                sx={{ textAlign: "center", paddingY: 4 }} style={{
                    position: 'relative',
                    width: '100%',
                    height: '490px',
                    maxHeight: '490px',
                    overflow: 'hidden',
                    zIndex: 0,
                    borderRadius: '8px',
                    padding: '30px',
                    marginBottom: '20px',
                }}
            >
                <Box
                    component="iframe"
                    src="https://www.youtube.com/embed/w51WHx0knpA?autoplay=1&mute=1&loop=1&playlist=w51WHx0knpA"
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
                        allowReplay: 'true',
                    }}
                />
                <Box sx={{ paddingTop: "350px" }}>
                    <Typography variant="h1" sx={{ fontSize: '64px', color: "white", fontWeight: "600", textAlign: "start", lineHeight: "70px", textTransform: "uppercase", letterSpacing: "0.-1em" }}>Farm2Fork</Typography>
                </Box>
            </Container>
            <Box sx={{ width:"65%" }}>
                <Typography variant="body1" >A Farm2Fork mindennapi működtetése során nagy hangsúlyt fektetünk a környezetbarát megoldásokra és a bio alapanyagok beszerzésére. A farm-to-table elvnek megfelelően célunk, hogy a szállított zöldségek és gyümölcsök minél kevesebbet utazzanak a termelés helyétől a felhasználást jelentő konyháig. Emellett kulcsfontosságú a szoros személyes kapcsolat is, hiszen összekötő szerepet töltünk be a séfek és a termelők között, ezáltal segítve mindkét fél munkáját és a közös fejlődést.</Typography>
            </Box>
        </Container>
    );
}
