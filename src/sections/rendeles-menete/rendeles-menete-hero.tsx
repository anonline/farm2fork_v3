import { Container, Typography } from "@mui/material"

export default function RendelesMeneteHero() {
    const h1Style = {
        fontSize: { xs: "48px", "@media (min-width:767px)": { fontSize: "64px" } },
        lineHeight: { xs: "57.6px", "@media (min-width:767px)": { lineHeight: "72px" } },
        fontWeight:600,
        textTransform: "uppercase",
        letterSpacing:"-1px",
        TextDecoder: "bold",
    };
    const textStyle = {
        lineHeight:"28px",
        fontSize:"16px",
        fontWeight:400,
        textSizeadjust:"100%",
    }
    return (
        <Container sx={{textalign:"start", gap:"20px"}}>
            <Typography sx={h1Style} component="h1" gutterBottom>
                Rendelés menete
            </Typography>
            <Typography sx={textStyle} gutterBottom>
                A Farm2Fork egy kisvállalkozás, amely a legjobb minőséget nyújtó magyar termelők zöldségeit és gyömölcseit juttatja el a konyhádba. Ezen a platformon olyan termékeket vásárolhatsz kényelmesen, amikhez egyébként csak rengeteg szervezés útján tudnál hozzáférni. Ismerd meg a termelői hálózatunkat és válogass a csúcsminőségű termékek közül.
            </Typography>
        </Container>
    );
}