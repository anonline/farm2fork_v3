import { Container, Typography } from "@mui/material"

export default function RendelesMeneteHero() {
    const h1Style = {
        fontSize: { xs: "48px", "@media (min-width:767px)": { fontSize: "64px" } },
        lineheight: { xs: "57.6px", "@media (min-width:767px)": { lineHeight: "72px" } },
        fontweight:600,
        texttransform: "uppercase",
        letterspacing:"-1px",
        TextDecoder: "bold",
    };
    const textStyle = {
        lineheight:"28px",
        fontsize:"16px",
        fontweight:400,
        textsizeadjust:"100%",
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