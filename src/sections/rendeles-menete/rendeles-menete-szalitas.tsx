import { Box, List, Typography } from "@mui/material";
import F2FIcons from "src/components/f2ficons/f2ficons";
import SzalitasLista from "./szalitasilista";

export default function RendelesMeneteSzalitas() {
    const listtext = [
        { text: "Éttermeknek ingyenes a kiszállítás. A minimális rendelési összeg nettó 18 000 Ft" },
        { text: 'Magánszemélyeknek pedig a budai oldalon I., II. és III. XI. és XII. és a pesti oldalon az V., VI., VII.,VIII., XIII. IX. XIV. kerületekben szállítunk ki.' },
        { text: 'Budaörs, Biatorbágy, Törökbálint és Tata – hétfőn 12-16 óra között' },
        { text: 'Buda (kiv. III.  és XI. ker) – kedden 8-12 és csütörtökön 12-18 óra között' },
        { text: 'Buda – III. kerület: kedden 12-16 és csütörtökön 16-20 óra között' },
        { text: 'Buda – XI. ker – hétfőn 12-16 és csütörtökön 12-16 óra között' },
        { text: 'Pest – magánszemélyek részére kedden és csütörtökön 12-19 óra között' },
        { text: 'Szentendre/Pilisszentlászló/Budakalász/Üröm: kedd délután (12-16 óra között) van szállítás.' },
        { text: 'Balaton: a nyári szezonban Balatonakarattyától Tihanyig (71-es út mentén) szállítunk keddi napokon.' },
        { text: 'Veszprém – kedd délután (12-16 óra között) van szállítás.' },
    ];

    return (
        <Box sx={{
            display: "flex",
            gap: "20px",
            flexDirection: { xs: 'column', '@media (min-width:1025px)': { flexDirection: 'row' } },
            alignItems: "start",
            paddingX: { xs: '20px', '@media (min-width:1025px)': { paddingX: '0px' }},
        }}>
            <Box sx={{minWidth:"124.338px", height:"105.6px", textAlign:"center"}}>
                <F2FIcons name="Truck" height={100} width={100} style={{ color: "#4A6E51" }} />
            </Box>
            <Box sx={{ display: "flex", gap: "20px", flexDirection: "column" }}>
                <Typography sx={{
                    fontSize: "28px",
                    fontWeight: 600,
                    lineHeight: "36px",
                    textTransform: "uppercase",
                }}>Szállítás</Typography>

                <List sx={{ paddingLeft: "5%" }}>
                    <SzalitasLista adat={listtext} />
                </List>
            </Box>
        </Box>
    );
}
