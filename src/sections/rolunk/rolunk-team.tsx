import { Box, Grid, Container, Typography } from "@mui/material";

export default function RolunkTeam() {
  return (
    <Container sx={{marginTop:"40px", marginBottom:"40px", fontFamily: " -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;", fontSize: "16px", fontWeight: "400", lineHeight: "24px", textAlign: "start", alignSelf: "auto", minWidth:"100%", }}>
        <Grid container rowSpacing={1}>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6}}>
                <img src="https://farm2fork.hu/wp-content/uploads/2024/11/Rectangle-7.jpg" alt="Horváth Boldizsár" style={{ borderRadius: "8px", maxWidth: "100%", alignSelf: "center",  }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }}>   
                <Box sx={{ minWidth:"350px", flexDirection: "column", justifyContent: "center", height: "100%", padding: "20px",  }}>
                    <Typography sx={{ textTransform: "uppercase", fontSize:"28px", fontWeight: "bold", fontFamily:"Bricolage Grotesque, Sans-serif",display: { xs: 'none', md: 'block' } }} component="h2" gutterBottom>Horváth Boldizsár</Typography>
                    <Typography sx={{ textTransform: "uppercase", fontSize:"20px", fontWeight: "bold", fontFamily:"Bricolage Grotesque, Sans-serif",display: { xs: 'block', md: 'none' } }} component="h2" gutterBottom>Horváth Boldizsár</Typography>
                    <p></p>
                    <Typography gutterBottom sx={{fontFamily:"Inter, sans-serif"}}>A Farm2Fork vállalkozás alapítója és tulajdonosa. Minden nap azon dolgozom, hogy a magyar termelőket összekössem a top éttermekkel és a kiváló minőségű, helyi alapanyagokra nyitott lakossági megrendelőkkel.</Typography>
                    <Typography gutterBottom sx={{fontFamily:"Inter, sans-serif"}}>Kollégáimmal büszkék vagyunk arra, hogy több étteremnek is beszállítója lehetünk. Ezen éttermek mindegyikének fontos, hogy a magas minőség, a szezonalitás és a finom ételek mellett beszerzéseikkel a hazai termelőket támogassák – ez pedig a Farm2Fork egyik legfőbb célkitűzése is. Partnereinkkel méltányos kereskedelemi formát alakítottunk ki, így a rendeléseddel te is közvetlenül támogathatod a magyar bio- és konvencionális termelőket.</Typography>
                </Box>
            </Grid>
        </Grid>
    </Container>
  );
}